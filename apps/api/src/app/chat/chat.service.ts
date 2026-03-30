import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { z } from "zod";
import { DrizzleService } from "#src/modules/drizzle/drizzle.service.js";
import { eq, and, desc } from "@repo/database";
import { schema } from "@repo/database";
import {
  roomSchema,
  roomWithMembersSchema,
  roomMemberSchema,
  invitationSchema,
  messageSchema,
  paginatedMessagesSchema,
  type CreateRoomInput,
  type CreateMessageInput,
} from "./chat.contract.js";

export type Room = z.infer<typeof roomSchema>;
export type RoomWithMembers = z.infer<typeof roomWithMembersSchema>;
export type RoomMember = z.infer<typeof roomMemberSchema>;
export type Invitation = z.infer<typeof invitationSchema>;
export type Message = z.infer<typeof messageSchema>;
export type PaginatedMessages = z.infer<typeof paginatedMessagesSchema>;

@Injectable()
export class ChatService {
  constructor(private readonly drizzle: DrizzleService) {}

  async createRoom(userId: string, data: CreateRoomInput): Promise<Room> {
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

    return roomSchema.parse(room);
  }

  async getRooms(userId: string): Promise<Room[]> {
    const members = await this.drizzle.db
      .select()
      .from(schema.chatMember)
      .where(eq(schema.chatMember.userId, userId));

    if (members.length === 0) {
      return [];
    }

    const roomIds = members.map((m) => m.roomId);
    const rooms = await this.drizzle.db.select().from(schema.chatRoom);

    return rooms
      .filter((room) => roomIds.includes(room.id))
      .map((r) => roomSchema.parse(r));
  }

  async getRoom(
    userId: string,
    roomId: string,
  ): Promise<RoomWithMembers | null> {
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

    return roomWithMembersSchema.parse({
      ...room,
      members,
    });
  }

  async getMembers(roomId: string): Promise<RoomMember[]> {
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

    return members.map((m) => roomMemberSchema.parse(m));
  }

  async inviteMember(
    inviterId: string,
    roomId: string,
    inviteeId: string,
  ): Promise<Invitation> {
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

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [invitation] = await this.drizzle.db
      .insert(schema.chatInvitation)
      .values({
        roomId,
        inviterId,
        inviteeId,
        status: "pending",
        expiresAt,
      })
      .returning();

    if (!invitation) {
      throw new Error("Failed to create invitation");
    }

    return invitationSchema.parse(invitation);
  }

  async getInvitations(userId: string): Promise<Invitation[]> {
    const invitations = await this.drizzle.db
      .select()
      .from(schema.chatInvitation)
      .where(
        and(
          eq(schema.chatInvitation.inviteeId, userId),
          eq(schema.chatInvitation.status, "pending"),
        ),
      );

    return invitations.map((i) => invitationSchema.parse(i));
  }

  async acceptInvitation(
    userId: string,
    invitationId: string,
  ): Promise<Invitation> {
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

    return invitationSchema.parse(updatedInvitation);
  }

  async declineInvitation(
    userId: string,
    invitationId: string,
  ): Promise<Invitation> {
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

    return invitationSchema.parse(updatedInvitation);
  }

  async getMessages(
    roomId: string,
    options: { limit?: number; cursor?: string | undefined },
  ): Promise<PaginatedMessages> {
    const limit = options.limit ?? 50;

    const messages = await this.drizzle.db
      .select()
      .from(schema.chatMessage)
      .where(eq(schema.chatMessage.roomId, roomId))
      .orderBy(desc(schema.chatMessage.createdAt))
      .limit(limit);

    return paginatedMessagesSchema.parse({
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
  ): Promise<Message> {
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

    return messageSchema.parse(message);
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

    await this.drizzle.db
      .delete(schema.chatMember)
      .where(eq(schema.chatMember.id, membership.id));
  }

  async deleteRoom(roomId: string): Promise<void> {
    await this.drizzle.db
      .delete(schema.chatRoom)
      .where(eq(schema.chatRoom.id, roomId));
  }
}
