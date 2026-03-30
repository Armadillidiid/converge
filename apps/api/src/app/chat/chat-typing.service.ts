import { Injectable } from "@nestjs/common";
import { RedisService } from "#src/modules/redis/redis.service.js";

@Injectable()
export class ChatTypingService {
  private readonly TYPING_TIMEOUT = 3000; // 3 seconds

  constructor(private readonly redis: RedisService) {}

  private getClient() {
    return this.redis.redis;
  }

  async setTyping(roomId: string, userId: string): Promise<void> {
    const client = this.getClient();
    const key = `typing:room:${roomId}`;
    await client.hset(key, userId, Date.now().toString());
    await client.expire(key, this.TYPING_TIMEOUT);
  }

  async clearTyping(roomId: string, userId: string): Promise<void> {
    const client = this.getClient();
    await client.hdel(`typing:room:${roomId}`, userId);
  }

  async getTypingUsers(roomId: string): Promise<string[]> {
    const client = this.getClient();
    return client.hkeys(`typing:room:${roomId}`);
  }
}
