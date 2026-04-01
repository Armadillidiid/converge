import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { AuthModule } from "#src/modules/auth/auth.module.js";
import { DrizzleModule } from "#src/modules/drizzle/drizzle.module.js";
import { RedisModule } from "#src/modules/redis/redis.module.js";
import { ChatController } from "./chat.controller.js";
import { ChatService } from "./chat.service.js";
import { ChatGateway } from "./chat.gateway.js";
import { ChatPresenceService } from "./chat-presence.service.js";
import { ChatTypingService } from "./chat-typing.service.js";
import { COPILOT_QUEUE } from "./copilot/types.js";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { CopilotQueueEvents } from "./copilot/copilot-queue.events.js";
import { CopilotRateLimit } from "./copilot/copilot.rate-limit.ts";

@Module({
  imports: [
    AuthModule,
    DrizzleModule,
    RedisModule,
    BullModule.registerQueue({
      name: COPILOT_QUEUE,
    }),
    BullBoardModule.forFeature({
      name: COPILOT_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    ChatPresenceService,
    ChatTypingService,
    CopilotQueueEvents,
    CopilotRateLimit,
  ],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
