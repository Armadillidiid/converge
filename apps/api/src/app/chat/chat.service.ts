import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { DrizzleService } from "#src/modules/drizzle/drizzle.service.js";
import { eq, and, desc, inArray } from "@repo/database";
import { schema } from "@repo/database";
import { COPILOT_USER_ID } from "@repo/database/constants";
import {
  roomDto,
  roomWithMembersDto,
  roomMemberDto,
  invitationDto,
  messageDto,
  paginatedMessagesDto,
  type RoomDto,
  type RoomWithMembersDto,
  type MemberDto,
  type InvitationDto,
  type MessageDto,
  type PaginatedMessagesDto,
} from "./chat.dto.js";
import {
  type CreateRoomInput,
  type CreateMessageInput,
} from "./chat.contract.js";
import { ChatPresenceService } from "./chat-presence.service.js";
import { ChatTypingService } from "./chat-typing.service.js";
import { COPILOT_QUEUE, COPILOT_MESSAGE_JOB } from "./copilot/types.js";
import { CopilotRateLimitGuard } from "./copilot/copilot-rate-limit.guard.js";
import { COPILOT_RATE_LIMIT_WINDOW_MS } from "./copilot/constants.js";

@Injectable()
export class ChatService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly presenceService: ChatPresenceService,
    private readonly typingService: ChatTypingService,
    private readonly rateLimitGuard: CopilotRateLimitGuard,
    @InjectQueue(COPILOT_QUEUE) private readonly copilotQueue: Queue,
  ) {}

  async createRoom(userId: string, data: CreateRoomInput): Promise<RoomDto> {
    const [room] = await this.drizzle.db
      .insert(schema.chatRoom)
      .values({
        name: data.name,
        ownerId: userId,
      })
      .returning();

    if (!room) {
      throw new Error("Failed to create room");
    }

    await this.drizzle.db.insert(schema.chatMember).values({
      roomId: room.id,
      userId: userId,
      role: "owner",
    });

    await this.drizzle.db.insert(schema.chatMember).values({
      roomId: room.id,
      userId: COPILOT_USER_ID,
      role: "member",
    });

    return roomDto.parse(room);
  }

  async getRooms(userId: string): Promise<RoomDto[]> {
    const members = await this.drizzle.db
      .select()
      .from(schema.chatMember)
      .where(eq(schema.chatMember.userId, userId));

    if (members.length === 0) {
      return [];
    }

    const roomIds = members.map((m) => m.roomId);
    const rooms = await this.drizzle.db.select().from(schema.chatRoom);

    // TODO: use roomListDto rather than parsing each room individually. Zod parsing can be expensive.
    return rooms
      .filter((room) => roomIds.includes(room.id))
      .map((r) => roomDto.parse(r));
  }

  async getRoom(
    userId: string,
    roomId: string,
  ): Promise<RoomWithMembersDto | null> {
    const [room] = await this.drizzle.db
      .select()
      .from(schema.chatRoom)
      .where(eq(schema.chatRoom.id, roomId))
      .limit(1);

    if (!room) {
      return null;
    }

    const members = await this.drizzle.db
      .select({
        id: schema.chatMember.id,
        userId: schema.chatMember.userId,
        role: schema.chatMember.role,
        joinedAt: schema.chatMember.joinedAt,
        user: {
          id: schema.user.id,
          name: schema.user.name,
          email: schema.user.email,
        },
      })
      .from(schema.chatMember)
      .innerJoin(schema.user, eq(schema.chatMember.userId, schema.user.id))
      .where(eq(schema.chatMember.roomId, roomId));

    return roomWithMembersDto.parse({
      ...room,
      members,
    });
  }

  async getMembers(roomId: string): Promise<MemberDto[]> {
    const members = await this.drizzle.db
      .select({
        id: schema.chatMember.id,
        userId: schema.chatMember.userId,
        role: schema.chatMember.role,
        joinedAt: schema.chatMember.joinedAt,
        user: {
          id: schema.user.id,
          name: schema.user.name,
          email: schema.user.email,
        },
      })
      .from(schema.chatMember)
      .innerJoin(schema.user, eq(schema.chatMember.userId, schema.user.id))
      .where(eq(schema.chatMember.roomId, roomId));

    return members.map((m) => roomMemberDto.parse(m));
  }

  async inviteMember(
    inviterId: string,
    roomId: string,
    email: string,
  ): Promise<InvitationDto> {
    const [room] = await this.drizzle.db
      .select()
      .from(schema.chatRoom)
      .where(eq(schema.chatRoom.id, roomId))
      .limit(1);

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    if (room.ownerId !== inviterId) {
      throw new ForbiddenException("Only room owner can invite members");
    }

    const [invitee] = await this.drizzle.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1);

    if (!invitee) {
      throw new NotFoundException("User not found");
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [invitation] = await this.drizzle.db
      .insert(schema.chatInvitation)
      .values({
        roomId,
        inviterId,
        inviteeId: invitee.id,
        status: "pending",
        expiresAt,
      })
      .returning();

    if (!invitation) {
      throw new Error("Failed to create invitation");
    }

    return invitationDto.parse(invitation);
  }

  async getInvitations(userId: string): Promise<InvitationDto[]> {
    const invitations = await this.drizzle.db
      .select()
      .from(schema.chatInvitation)
      .where(
        and(
          eq(schema.chatInvitation.inviteeId, userId),
          eq(schema.chatInvitation.status, "pending"),
        ),
      );

    return invitations.map((i) => invitationDto.parse(i));
  }

  async acceptInvitation(
    userId: string,
    invitationId: string,
  ): Promise<InvitationDto> {
    const [invitation] = await this.drizzle.db
      .select()
      .from(schema.chatInvitation)
      .where(eq(schema.chatInvitation.id, invitationId))
      .limit(1);

    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }

    if (invitation.inviteeId !== userId) {
      throw new ForbiddenException("You are not the invitee");
    }

    if (invitation.status !== "pending") {
      throw new ForbiddenException("Invitation is no longer pending");
    }

    if (new Date() > invitation.expiresAt) {
      throw new ForbiddenException("Invitation has expired");
    }

    const [updatedInvitation] = await this.drizzle.db
      .update(schema.chatInvitation)
      .set({ status: "accepted" })
      .where(eq(schema.chatInvitation.id, invitationId))
      .returning();

    if (!updatedInvitation) {
      throw new Error("Failed to update invitation");
    }

    await this.drizzle.db.insert(schema.chatMember).values({
      roomId: invitation.roomId,
      userId: userId,
      role: "member",
    });

    return invitationDto.parse(updatedInvitation);
  }

  async declineInvitation(
    userId: string,
    invitationId: string,
  ): Promise<InvitationDto> {
    const [invitation] = await this.drizzle.db
      .select()
      .from(schema.chatInvitation)
      .where(eq(schema.chatInvitation.id, invitationId))
      .limit(1);

    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }

    if (invitation.inviteeId !== userId) {
      throw new ForbiddenException("You are not the invitee");
    }

    const [updatedInvitation] = await this.drizzle.db
      .update(schema.chatInvitation)
      .set({ status: "declined" })
      .where(eq(schema.chatInvitation.id, invitationId))
      .returning();

    if (!updatedInvitation) {
      throw new Error("Failed to decline invitation");
    }

    return invitationDto.parse(updatedInvitation);
  }

  async getMessages(
    roomId: string,
    options: { limit?: number; cursor?: string | undefined },
  ): Promise<PaginatedMessagesDto> {
    const limit = options.limit ?? 50;

    const messages = await this.drizzle.db
      .select()
      .from(schema.chatMessage)
      .where(eq(schema.chatMessage.roomId, roomId))
      .orderBy(desc(schema.chatMessage.createdAt))
      .limit(limit);

    return paginatedMessagesDto.parse({
      items: messages,
      nextCursor:
        messages.length === limit
          ? messages[messages.length - 1]?.id
          : undefined,
    });
  }

  async createMessage(
    senderId: string,
    roomId: string,
    data: CreateMessageInput,
  ): Promise<MessageDto> {
    const [message] = await this.drizzle.db
      .insert(schema.chatMessage)
      .values({
        roomId,
        senderId,
        content: data.content,
      })
      .returning();

    if (!message) {
      throw new Error("Failed to create message");
    }

    if (data.content.toLowerCase().includes("@copilot")) {
      const { allowed } = await this.rateLimitGuard.checkLimit(senderId);

      const jobOptions = allowed ? {} : { delay: COPILOT_RATE_LIMIT_WINDOW_MS };

      await this.copilotQueue.add(
        COPILOT_MESSAGE_JOB,
        {
          messageId: message.id,
          roomId,
          senderId,
          content: data.content,
        },
        jobOptions,
      );
    }

    return messageDto.parse(message);
  }

  async leaveRoom(userId: string, roomId: string): Promise<void> {
    const [membership] = await this.drizzle.db
      .select()
      .from(schema.chatMember)
      .where(
        and(
          eq(schema.chatMember.userId, userId),
          eq(schema.chatMember.roomId, roomId),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new NotFoundException("You are not a member of this room");
    }

    // TODO: add logic to transfer ownership if the owner leaves. For now, we just delete the room if the owner leaves.

    // TODO: Add soft delete so when a member leaves, we can still link messages attributed to that member int the room.

    await this.drizzle.db
      .delete(schema.chatMember)
      .where(eq(schema.chatMember.id, membership.id));
  }

  async deleteRoom(roomId: string): Promise<void> {
    await this.drizzle.db
      .delete(schema.chatRoom)
      .where(eq(schema.chatRoom.id, roomId));
  }

  async getPresence(
    roomId: string,
  ): Promise<{ onlineUsers: Array<{ userId: string; userName: string }> }> {
    const userIds = await this.presenceService.getOnlineUsers(roomId);

    if (userIds.length === 0) {
      return { onlineUsers: [] };
    }

    const users = await this.drizzle.db
      .select({
        id: schema.user.id,
        name: schema.user.name,
      })
      .from(schema.user)
      .where(inArray(schema.user.id, userIds));

    return {
      onlineUsers: users.map((u) => ({ userId: u.id, userName: u.name })),
    };
  }

  async getTyping(
    roomId: string,
  ): Promise<{ typingUsers: Array<{ userId: string; userName: string }> }> {
    const userIds = await this.typingService.getTypingUsers(roomId);

    if (userIds.length === 0) {
      return { typingUsers: [] };
    }

    const users = await this.drizzle.db
      .select({
        id: schema.user.id,
        name: schema.user.name,
      })
      .from(schema.user)
      .where(inArray(schema.user.id, userIds));

    return {
      typingUsers: users.map((u) => ({ userId: u.id, userName: u.name })),
    };
  }
}
