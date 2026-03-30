import { Module } from "@nestjs/common";
import { DrizzleModule } from "#src/modules/drizzle/drizzle.module.js";
import { RedisModule } from "#src/modules/redis/redis.module.js";
import { ChatController } from "./chat.controller.js";
import { ChatService } from "./chat.service.js";
import { ChatGateway } from "./chat.gateway.js";
import { ChatPresenceService } from "./chat-presence.service.js";
import { ChatTypingService } from "./chat-typing.service.js";

@Module({
  imports: [DrizzleModule, RedisModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ChatPresenceService, ChatTypingService],
})
export class ChatModule {}
