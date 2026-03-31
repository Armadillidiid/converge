import { Injectable, Logger } from "@nestjs/common";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
import { CopilotAiService } from "./copilot-ai.service.js";
import { DrizzleService } from "#src/modules/drizzle/drizzle.service.js";
import { schema } from "@repo/database";
import { COPILOT_USER_ID } from "@repo/database/constants";
import { COPILOT_QUEUE, COPILOT_MESSAGE_JOB } from "./types.js";
import type { CopilotMessageJob } from "./types.js";

@Injectable()
@Processor(COPILOT_QUEUE)
export class CopilotProcessor extends WorkerHost {
  private readonly logger = new Logger(CopilotProcessor.name);

  constructor(
    private readonly aiService: CopilotAiService,
    private readonly drizzle: DrizzleService,
  ) {
    super();
  }

  async process(job: Job): Promise<string | null> {
    if (job.name !== COPILOT_MESSAGE_JOB) {
      return null;
    }

    const data = job.data as CopilotMessageJob;
    const { roomId, content } = data;

    try {
      this.logger.log(`Processing copilot job for room ${roomId}`);

      const context = await this.aiService.buildContext(roomId);

      if (!content.toLowerCase().includes("@copilot")) {
        return null;
      }

      const response = await this.aiService.generateResponse(context, content);

      const [message] = await this.drizzle.db
        .insert(schema.chatMessage)
        .values({
          roomId,
          senderId: COPILOT_USER_ID,
          content: response,
        })
        .returning();

      if (!message) {
        throw new Error("Failed to create copilot message");
      }

      this.logger.log(`Copilot responded in room ${roomId}`);
      return message.id;
    } catch (error) {
      this.logger.error(`Copilot job failed for room ${roomId}:`, error);

      if (job.attemptsMade >= (job.opts.attempts ?? 3) - 1) {
        await this.sendFailureMessage(roomId, error);
      }

      throw error;
    }
  }

  private async sendFailureMessage(
    roomId: string,
    error: unknown,
  ): Promise<void> {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    try {
      const [message] = await this.drizzle.db
        .insert(schema.chatMessage)
        .values({
          roomId,
          senderId: COPILOT_USER_ID,
          content: `Sorry, I encountered an error while processing your request: ${errorMessage}`,
        })
        .returning();

      if (message) {
        this.logger.log(`Copilot failure message created: ${message.id}`);
      }
    } catch (sendError) {
      this.logger.error(`Failed to send failure message:`, sendError);
    }
  }
}
