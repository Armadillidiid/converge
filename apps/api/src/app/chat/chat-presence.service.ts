import { Injectable } from "@nestjs/common";
import { RedisService } from "#src/modules/redis/redis.service.js";

@Injectable()
export class ChatPresenceService {
  constructor(private readonly redis: RedisService) {}

  private getClient() {
    return this.redis.redis;
  }

  async setUserOnline(userId: string, socketId: string): Promise<void> {
    const client = this.getClient();
    await client.sadd(`presence:user:${userId}`, socketId);
  }

  async setUserOffline(userId: string, socketId: string): Promise<void> {
    const client = this.getClient();
    await client.srem(`presence:user:${userId}`, socketId);

    const remaining = await client.scard(`presence:user:${userId}`);
    if (remaining === 0) {
      const rooms = await client.smembers(`presence:rooms:${userId}`);
      for (const roomId of rooms) {
        await client.srem(`presence:room:${roomId}`, userId);
      }
      await client.del(`presence:rooms:${userId}`);
    }
  }

  async joinRoom(roomId: string, userId: string): Promise<void> {
    const client = this.getClient();
    await client.sadd(`presence:room:${roomId}`, userId);
    await client.sadd(`presence:rooms:${userId}`, roomId);
  }

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    const client = this.getClient();
    await client.srem(`presence:room:${roomId}`, userId);
    await client.srem(`presence:rooms:${userId}`, roomId);
  }

  async getOnlineUsers(roomId: string): Promise<string[]> {
    const client = this.getClient();
    return client.smembers(`presence:room:${roomId}`);
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const client = this.getClient();
    const count = await client.scard(`presence:user:${userId}`);
    return count > 0;
  }
}
