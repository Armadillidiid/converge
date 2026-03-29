import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  ThrottlerModule as ThrottlerModulePure,
  ThrottlerGuard,
  seconds,
  type ThrottlerStorage,
} from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { RedisModule, THROTTLER_REDIS_STORAGE } from "../redis/redis.module.js";
import type { AppConfig } from "../../app.config.js";

@Module({
  imports: [
    RedisModule,
    ThrottlerModulePure.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, THROTTLER_REDIS_STORAGE],
      useFactory: (
        configService: ConfigService<AppConfig>,
        storage: ThrottlerStorage,
      ) => {
        const ttl = configService.getOrThrow("RATE_LIMIT_TTL", { infer: true });
        const limit = configService.getOrThrow("RATE_LIMIT_MAX", {
          infer: true,
        });

        return {
          throttlers: [{ ttl: seconds(ttl), limit }],
          storage,
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [],
})
export class RateLimitModule {}
