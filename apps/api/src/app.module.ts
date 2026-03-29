import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullMqModule } from "#src/modules/bullmq/bullmq.module.js";
import { DrizzleModule } from "./modules/drizzle/drizzle.module.js";
import { RateLimitModule } from "./modules/ratelimit/ratelimit.module.js";
import { RedisModule } from "./modules/redis/redis.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { appConfig } from "./app.config.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { EmailModule } from "./modules/email/email.module.js";
import { ListingsModule } from "./app/listings/listings.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [appConfig],
    }),
    RedisModule,
    RateLimitModule,
    BullMqModule,
    EmailModule,
    DrizzleModule,
    AuthModule,
    ListingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
