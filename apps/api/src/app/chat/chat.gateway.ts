import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Injectable, Logger, UseGuards } from "@nestjs/common";
import type { Server, Socket } from "socket.io";
import { AuthGuard } from "#src/modules/better-auth/guards/auth.guard.js";
import type { UserSession } from "#src/modules/better-auth/guards/auth.guard.js";
import { ChatService } from "./chat.service.js";
import { ChatPresenceService } from "./chat-presence.service.js";
import { ChatTypingService } from "./chat-typing.service.js";

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    userName: string;
  };
  request: any;
}

@Injectable()
@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/chat",
})
@UseGuards(AuthGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly presenceService: ChatPresenceService,
    private readonly typingService: ChatTypingService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const user = (client.request as any).user as UserSession;
      if (!user) {
        client.disconnect();
        return;
      }

      client.data = {
        userId: user.user.id,
        userName: user.user.name,
      };

      // Get user's rooms and join them
      const rooms = await this.chatService.getRooms(user.user.id);
      for (const room of rooms) {
        await client.join(`room:${room.id}`);
        await this.presenceService.joinRoom(room.id, user.user.id);
      }

      await this.presenceService.setUserOnline(user.user.id, client.id);

      this.logger.log(`User ${user.user.id} connected`);
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
    payload: { roomId: string },
  ) {
    const userId = client.data.userId;
    const { roomId } = payload;

    // Verify membership
    const membership = await this.chatService.getMembers(roomId);
    const isMember = membership.some((m) => m.userId === userId);

    if (!isMember) {
      client.emit("error", { message: "You are not a member of this room" });
      return;
    }

    await client.join(`room:${roomId}`);
    await this.presenceService.joinRoom(roomId, userId);

    // Broadcast presence to room
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
    payload: { roomId: string },
  ) {
    const userId = client.data.userId;
    const { roomId } = payload;

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
    payload: { roomId: string; content: string },
  ) {
    const userId = client.data.userId;
    const { roomId, content } = payload;

    if (!content || content.trim().length === 0) {
      return;
    }

    // Save message to DB
    const message = await this.chatService.createMessage(userId, roomId, {
      content: content.trim(),
    });

    // Broadcast to room
    this.server.to(`room:${roomId}`).emit("message:new", {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderName: client.data.userName,
      content: message.content,
      createdAt: message.createdAt,
    });
  }

  @SubscribeMessage("typing_start")
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    payload: { roomId: string },
  ) {
    const userId = client.data.userId;
    const { roomId } = payload;

    await this.typingService.setTyping(roomId, userId);

    // Broadcast to room (excluding sender)
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
    payload: { roomId: string },
  ) {
    const userId = client.data.userId;
    const { roomId } = payload;

    await this.typingService.clearTyping(roomId, userId);

    client.to(`room:${roomId}`).emit("user:typing", {
      userId,
      roomId,
      isTyping: false,
    });
  }
}
