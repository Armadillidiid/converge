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
  type WsJoinRoomInput,
  type WsLeaveRoomInput,
  type WsSendMessageInput,
  type WsTypingInput,
} from "./chat-events.js";

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    userName: string;
    session?: UserSession;
  };
}

@Injectable()
@UseGuards(SocketIOAuthGuard)
@WebSocketGateway({
  cors: { origin: "*" },
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
      const userId = client.data?.userId;
      if (!userId) return;

      await this.presenceService.setUserOffline(userId, client.id);

      this.logger.log(`User ${userId} disconnected`);
    } catch (error) {
      this.logger.error("Disconnect error:", error);
    }
  }

  @SubscribeMessage("join_room")
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: unknown,
  ) {
    const parsed = wsJoinRoomInputSchema.safeParse(payload);
    if (!parsed.success) {
      client.emit("error", { message: "Invalid payload" });
      return;
    }

    const { roomId } = parsed.data as WsJoinRoomInput;
    const userId = client.data.userId;

    const membership = await this.chatService.getMembers(roomId);
    const isMember = membership.some((m) => m.userId === userId);

    if (!isMember) {
      client.emit("error", { message: "You are not a member of this room" });
      return;
    }

    await client.join(`room:${roomId}`);
    await this.presenceService.joinRoom(roomId, userId);

    this.server.to(`room:${roomId}`).emit("user:presence", {
      userId,
      userName: client.data.userName,
      roomId,
      status: "online",
    });
  }

  @SubscribeMessage("leave_room")
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: unknown,
  ) {
    const parsed = wsLeaveRoomInputSchema.safeParse(payload);
    if (!parsed.success) {
      client.emit("error", { message: "Invalid payload" });
      return;
    }

    const { roomId } = parsed.data as WsLeaveRoomInput;
    const userId = client.data.userId;

    await client.leave(`room:${roomId}`);
    await this.presenceService.leaveRoom(roomId, userId);

    this.server.to(`room:${roomId}`).emit("user:presence", {
      userId,
      roomId,
      status: "offline",
    });
  }

  @SubscribeMessage("send_message")
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: unknown,
  ) {
    const parsed = wsSendMessageInputSchema.safeParse(payload);
    if (!parsed.success) {
      client.emit("error", { message: "Invalid payload" });
      return;
    }

    const { roomId, content } = parsed.data as WsSendMessageInput;
    const userId = client.data.userId;

    client.to(`room:${roomId}`).emit("message:new", {
      roomId,
      senderId: userId,
      senderName: client.data.userName,
      content: content.trim(),
    });
  }

  @SubscribeMessage("typing_start")
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: unknown,
  ) {
    const parsed = wsTypingInputSchema.safeParse(payload);
    if (!parsed.success) {
      client.emit("error", { message: "Invalid payload" });
      return;
    }

    const { roomId } = parsed.data as WsTypingInput;
    const userId = client.data.userId;

    await this.typingService.setTyping(roomId, userId);

    client.to(`room:${roomId}`).emit("user:typing", {
      userId,
      userName: client.data.userName,
      roomId,
      isTyping: true,
    });
  }

  @SubscribeMessage("typing_stop")
  async handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: unknown,
  ) {
    const parsed = wsTypingInputSchema.safeParse(payload);
    if (!parsed.success) {
      client.emit("error", { message: "Invalid payload" });
      return;
    }

    const { roomId } = parsed.data as WsTypingInput;
    const userId = client.data.userId;

    await this.typingService.clearTyping(roomId, userId);

    client.to(`room:${roomId}`).emit("user:typing", {
      userId,
      roomId,
      isTyping: false,
    });
  }
}
