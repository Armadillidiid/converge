import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { DrizzleModule } from "#src/modules/drizzle/drizzle.module.js";
import { RedisModule } from "#src/modules/redis/redis.module.js";
import { CopilotProcessor } from "./copilot.processor.js";
import { CopilotAiService } from "./copilot-ai.service.js";
import { CopilotRateLimit } from "./copilot.rate-limit.ts";
import { ModelInfoService } from "./model-info.service.js";
import { CompactionService } from "./compaction.service.js";
import { CompactionProcessor } from "./compaction.processor.js";
import { COPILOT_QUEUE } from "./types.js";
import { COMPACTION_QUEUE } from "./compaction.types.js";

@Module({
  imports: [
    BullModule.registerQueue({
      name: COPILOT_QUEUE,
    }),
    BullModule.registerQueue({
      name: COMPACTION_QUEUE,
    }),
    DrizzleModule,
    RedisModule,
  ],
  providers: [
    CopilotProcessor,
    CopilotAiService,
    CopilotRateLimit,
    ModelInfoService,
    CompactionService,
    CompactionProcessor,
  ],
  exports: [
    CopilotAiService,
    CopilotRateLimitGuard,
    ModelInfoService,
    CompactionService,
  ],
  exports: [CopilotAiService, CopilotRateLimit, ModelInfoService],
})
export class CopilotModule {}
