import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module.js";
import { DrizzleModule } from "./modules/drizzle/drizzle.module.js";
import { RedisModule } from "./modules/redis/redis.module.js";
import { EmailModule } from "./modules/email/email.module.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { ListingsModule } from "./app/listings/listings.module.js";
import { ChatModule } from "./app/chat/chat.module.js";

@Module({
  imports: [
    AuthModule,
    DrizzleModule,
    RedisModule,
    EmailModule,
    ListingsModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
