import { Injectable } from "@nestjs/common";
import { RedisService } from "#src/modules/redis/redis.service.js";
import {
  COPILOT_RATE_LIMIT_COUNT,
  COPILOT_RATE_LIMIT_WINDOW_MS,
} from "./constants.ts";

@Injectable()
export class CopilotRateLimit {
  constructor(private readonly redis: RedisService) {}

  async checkLimit(
    userId: string,
  ): Promise<{ allowed: boolean; remaining: number }> {
    const key = `copilot:rate:${userId}`;
    const count = await this.redis.incr(key);

    if (count === 1) {
      await this.redis.expire(
        key,
        Math.floor(COPILOT_RATE_LIMIT_WINDOW_MS / 1000),
      );
    }

    const remaining = Math.max(0, COPILOT_RATE_LIMIT_COUNT - count);

    return {
      allowed: count <= COPILOT_RATE_LIMIT_COUNT,
      remaining,
    };
  }

  async getRemainingCount(userId: string): Promise<number> {
    const key = `copilot:rate:${userId}`;
    const count = (await this.redis.get(key))
      ? parseInt((await this.redis.get(key)) ?? "0", 10)
      : 0;
    return Math.max(0, COPILOT_RATE_LIMIT_COUNT - count);
  }
}
