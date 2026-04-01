import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Injectable, Logger, UseGuards } from "@nestjs/common";
import type { Server, Socket } from "socket.io";
import type { UserSession } from "#src/modules/better-auth/guards/auth.guard.js";
import { ChatService } from "./chat.service.js";
import { ChatPresenceService } from "./chat-presence.service.js";
import { ChatTypingService } from "./chat-typing.service.js";
import { SocketIOAuthService } from "#src/modules/better-auth/guards/socket-io-auth.service.js";
import { SocketIOAuthGuard } from "#src/modules/better-auth/guards/socket-io-auth.guard.js";
import {
  wsJoinRoomInputSchema,
  wsLeaveRoomInputSchema,
  wsSendMessageInputSchema,
  wsTypingInputSchema,
} from "./chat-events.contract.js";
import { CHAT_EVENTS } from "./chat.constant.ts";

interface AuthenticatedSocket extends Socket {
  data: {
    session: UserSession;
  };
}

const wsOrigins = (process.env["APP_TRUSTED_ORIGINS"] ?? "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const wsCorsOrigin = wsOrigins.includes("*") ? "*" : wsOrigins;

@Injectable()
@UseGuards(SocketIOAuthGuard)
@WebSocketGateway({
  cors: { origin: wsCorsOrigin },
  namespace: "/api/chat",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly presenceService: ChatPresenceService,
    private readonly typingService: ChatTypingService,
    private readonly authService: SocketIOAuthService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connecting: ${client.id}`);

    try {
      const session = await this.authService.authenticateClient(client);
      if (!session) {
        this.logger.warn(`No session found for ${client.id}`);
        client.disconnect();
        return;
      }

      // Get user's rooms and join them
      const rooms = await this.chatService.getRooms(session.user.id);
      for (const room of rooms) {
        await client.join(`room:${room.id}`);
        await this.presenceService.joinRoom(room.id, session.user.id);
      }

      await this.presenceService.setUserOnline(session.user.id, client.id);

      this.logger.log(`User ${session.user.id} connected`);
    } catch (error) {
      this.logger.error("Connection error:", error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    try {
      if (!client.data.session?.user?.id) {
        this.logger.warn(`No session found for ${client.id} on disconnect`);
        return;
      }
      const userId = client.data.session.user.id;

      await this.presenceService.setUserOffline(userId, client.id);

      this.logger.log(`User ${userId} disconnected`);
    } catch (error) {
      this.logger.error("Disconnect error:", error);
    }
  }

  @SubscribeMessage(CHAT_EVENTS.JOIN_ROOM)
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: unknown,
  ) {
    const parsed = wsJoinRoomInputSchema.safeParse(payload);
    if (!parsed.success) {
      client.emit("error", { message: "Invalid payload" });
      return;
    }

    const { roomId } = parsed.data;
    const userId = client.data.session.user.id;

    const membership = await this.chatService.getMembers(roomId);
    const isMember = membership.some((m) => m.userId === userId);

    if (!isMember) {
      client.emit("error", { message: "You are not a member of this room" });
      return;
    }

    await client.join(`room:${roomId}`);
    await this.presenceService.joinRoom(roomId, userId);

    this.server.to(`room:${roomId}`).emit(CHAT_EVENTS.USER_PRESENCE, {
      userId,
      userName: client.data.session.user.name,
      roomId,
      status: "online",
    });
  }

  @SubscribeMessage(CHAT_EVENTS.LEAVE_ROOM)
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: unknown,
  ) {
    const parsed = wsLeaveRoomInputSchema.safeParse(payload);
    if (!parsed.success) {
      client.emit("error", { message: "Invalid payload" });
      return;
    }

    const { roomId } = parsed.data;
    const userId = client.data.session.user.id;

    await client.leave(`room:${roomId}`);
    await this.presenceService.leaveRoom(roomId, userId);

    this.server.to(`room:${roomId}`).emit(CHAT_EVENTS.USER_PRESENCE, {
      userId,
      roomId,
      status: "offline",
    });
  }

  @SubscribeMessage(CHAT_EVENTS.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: unknown,
  ) {
    const parsed = wsSendMessageInputSchema.safeParse(payload);
    if (!parsed.success) {
      client.emit("error", { message: "Invalid payload" });
      return;
    }

    const { roomId, content } = parsed.data;
    if (!client.data.session?.user?.id) {
      client.emit("error", { message: "Unauthorized" });
      return;
    }
    const userId = client.data.session.user.id;

    const message = await this.chatService.createMessage(userId, roomId, {
      content: content.trim(),
    });

    this.server.to(`room:${roomId}`).emit(CHAT_EVENTS.MESSAGE_NEW, {
      id: message.id,
      roomId,
      senderId: userId,
      senderName: client.data.session.user.name,
      senderEmail: client.data.session.user.email,
      content: message.content,
      createdAt: message.createdAt,
    });
  }

  @SubscribeMessage(CHAT_EVENTS.TYPING_START)
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: unknown,
  ) {
    const parsed = wsTypingInputSchema.safeParse(payload);
    if (!parsed.success) {
      client.emit("error", { message: "Invalid payload" });
      return;
    }

    const { roomId } = parsed.data;
    const userId = client.data.session.user.id;

    await this.typingService.setTyping(roomId, userId);

    client.to(`room:${roomId}`).emit(CHAT_EVENTS.USER_TYPING, {
      userId,
      userName: client.data.session.user.name,
      roomId,
      isTyping: true,
    });
  }

  @SubscribeMessage(CHAT_EVENTS.TYPING_STOP)
  async handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: unknown,
  ) {
    const parsed = wsTypingInputSchema.safeParse(payload);
    if (!parsed.success) {
      client.emit("error", { message: "Invalid payload" });
      return;
    }

    const { roomId } = parsed.data;
    const userId = client.data.session.user.id;

    await this.typingService.clearTyping(roomId, userId);

    client.to(`room:${roomId}`).emit(CHAT_EVENTS.USER_TYPING, {
      userId,
      roomId,
      isTyping: false,
    });
  }
}
