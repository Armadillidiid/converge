import { Injectable, Logger } from "@nestjs/common";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
import { CompactionService } from "./compaction.service.js";
import {
  COMPACTION_QUEUE,
  COMPACTION_JOB,
  compactionJobSchema,
} from "./compaction.types.js";

@Injectable()
@Processor(COMPACTION_QUEUE)
export class CompactionProcessor extends WorkerHost {
  private readonly logger = new Logger(CompactionProcessor.name);

  constructor(private readonly compactionService: CompactionService) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name !== COMPACTION_JOB) return;

    const parseResult = compactionJobSchema.safeParse(job.data);
    if (!parseResult.success) {
      this.logger.error("Invalid job data", parseResult.error);
      return;
    }

    const { roomId } = parseResult.data;
    this.logger.log(`Processing compaction for room ${roomId}`);

    try {
      const latestSummary =
        await this.compactionService.getLatestSummary(roomId);
      const sinceDate = latestSummary?.createdAt ?? new Date(0);

      const messages = latestSummary
        ? await this.compactionService.getMessagesSinceSummary(
            roomId,
            sinceDate,
          )
        : [];

      if (messages.length < 10) {
        this.logger.log(`Not enough messages to compact for room ${roomId}`);
        return;
      }

      const summary = await this.compactionService.generateSummary(
        roomId,
        messages.map((m) => ({
          senderId: m.senderId,
          content: m.content,
          createdAt: m.createdAt,
        })),
      );

      await this.compactionService.saveSummary(
        roomId,
        summary,
        messages[0]?.id ?? null,
        messages[messages.length - 1]?.id ?? null,
      );

      this.logger.log(`Compaction complete for room ${roomId}`);
    } catch (error) {
      this.logger.error(`Compaction failed for room ${roomId}:`, error);
      throw error;
    }
  }
}
