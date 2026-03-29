import { Inject, Injectable, Module } from "@nestjs/common";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import type { Redis } from "ioredis";
import { RedisService } from "./redis.service.js";

export const REDIS_CLIENT = "REDIS_CLIENT";
export const THROTTLER_REDIS_STORAGE = "THROTTLER_REDIS_STORAGE";

/**
 * Injectable wrapper that lets NestJS DI own the ThrottlerStorageRedisService
 * instance. Extends the class so it is registered as a proper provider rather
 * than being manually instantiated at the call site.
 */
@Injectable()
export class ThrottlerRedisStorage extends ThrottlerStorageRedisService {
  constructor(@Inject(REDIS_CLIENT) redis: Redis) {
    super(redis);
  }
}

@Module({
  providers: [
    RedisService,
    {
      provide: REDIS_CLIENT,
      inject: [RedisService],
      useFactory: (redisService: RedisService) => redisService.redis,
    },
    ThrottlerRedisStorage,
    {
      provide: THROTTLER_REDIS_STORAGE,
      useExisting: ThrottlerRedisStorage,
    },
  ],
  exports: [
    RedisService,
    REDIS_CLIENT,
    ThrottlerRedisStorage,
    THROTTLER_REDIS_STORAGE,
  ],
})
export class RedisModule {}
