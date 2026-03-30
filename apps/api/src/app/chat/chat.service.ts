import { Injectable } from "@nestjs/common";
import { DrizzleService } from "#src/modules/drizzle/drizzle.service.js";
import { eq } from "@repo/database";
import { schema } from "@repo/database";

export interface CreateRoomInput {
  name: string;
}

export interface Room {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomWithMembers extends Room {
  members: Array<{
    id: string;
    userId: string;
    role: string;
    joinedAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

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

    return room;
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

    return rooms.filter((room) => roomIds.includes(room.id));
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

    return {
      ...room,
      members,
    };
  }

  async getMembers(roomId: string): Promise<
    Array<{
      id: string;
      userId: string;
      role: string;
      joinedAt: Date;
      user: { id: string; name: string; email: string };
    }>
  > {
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

    return members;
  }
}
