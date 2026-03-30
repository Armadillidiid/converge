import { Injectable } from "@nestjs/common";
import type { NodePgDatabase } from "@repo/database";
import { schema, eq } from "@repo/database";

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

@Injectable()
export class ChatService {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async createRoom(userId: string, data: CreateRoomInput): Promise<Room> {
    const [room] = await this.db
      .insert(schema.chatRoom)
      .values({
        name: data.name,
        ownerId: userId,
      })
      .returning();

    if (!room) {
      throw new Error("Failed to create room");
    }

    await this.db.insert(schema.chatMember).values({
      roomId: room.id,
      userId: userId,
      role: "owner",
    });

    return room;
  }

  async getRooms(userId: string): Promise<Room[]> {
    // Query: Get all room IDs where user is a member
    const members = await this.db
      .select()
      .from(schema.chatMember)
      .where(eq(schema.chatMember.userId, userId))

    if (members.length === 0) {
      return [];
    }

    // Query: Get the actual rooms
    const roomIds = members.map((m) => m.roomId);
    const rooms = await this.db.select().from(schema.chatRoom);

    // Filter to only rooms the user is a member of
    return rooms.filter((room) => roomIds.includes(room.id));
  }
}
