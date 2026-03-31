import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { DrizzleModule } from "#src/modules/drizzle/drizzle.module.js";
import { RedisModule } from "#src/modules/redis/redis.module.js";
import { CopilotProcessor } from "./copilot.processor.js";
import { CopilotAiService } from "./copilot-ai.service.js";
import { CopilotRateLimitGuard } from "./copilot-rate-limit.guard.js";
import { ModelInfoService } from "./model-info.service.js";
import { COPILOT_QUEUE } from "./types.js";

@Module({
  imports: [
    BullModule.registerQueue({
      name: COPILOT_QUEUE,
    }),
    DrizzleModule,
    RedisModule,
  ],
  providers: [
    CopilotProcessor,
    CopilotAiService,
    CopilotRateLimitGuard,
    ModelInfoService,
  ],
  exports: [CopilotAiService, CopilotRateLimitGuard, ModelInfoService],
})
export class CopilotModule {}
