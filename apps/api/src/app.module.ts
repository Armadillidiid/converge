import {
  Module,
  type MiddlewareConsumer,
  type NestModule,
} from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module.js";
import { BullMqModule } from "./modules/bullmq/bullmq.module.js";
import { DrizzleModule } from "./modules/drizzle/drizzle.module.js";
import { RedisModule } from "./modules/redis/redis.module.js";
import { EmailModule } from "./modules/email/email.module.js";
import { AppController } from "./app.controller.js";
import { AiModule } from "./app/ai/ai.module.js";
import { ChatModule } from "./app/chat/chat.module.js";
import { ConfigModule } from "@nestjs/config";
import { appConfig } from "./app.config.ts";
import { JsonBodyMiddleware } from "./middlewares/body/json.body.middleware.js";
import { RawBodyMiddleware } from "./middlewares/body/raw.body.middleware.js";
import { UrlencodedBodyMiddleware } from "./middlewares/body/urlencoded.body.middleware.js";
import { AppLoggerMiddleware } from "./middlewares/app-logger.middleware.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [appConfig],
    }),
    RedisModule,
    AuthModule,
    BullMqModule,
    DrizzleModule,
    EmailModule,
    AiModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes("auth/*path")
      .apply(UrlencodedBodyMiddleware)
      .forRoutes("*path")
      .apply(JsonBodyMiddleware)
      .exclude("auth/*path")
      .forRoutes("*path")
      .apply(AppLoggerMiddleware)
      .forRoutes("*path");
  }
}
