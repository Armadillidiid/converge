import {
  OnQueueEvent,
  QueueEventsHost,
  QueueEventsListener,
} from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { ChatGateway } from "../chat.gateway.ts";
import { COPILOT_QUEUE } from "./types.ts";
import { DrizzleService } from "#src/modules/drizzle/drizzle.service.js";
import { COPILOT_USER_ID } from "@repo/database/constants";
import { eq, schema } from "@repo/database";

@Injectable()
@QueueEventsListener(COPILOT_QUEUE)
export class CopilotQueueEvents extends QueueEventsHost {
  private readonly logger = new Logger(CopilotQueueEvents.name);

  constructor(
    private readonly chatGateway: ChatGateway,
    private readonly drizzle: DrizzleService,
  ) {
    super();
  }

  @OnQueueEvent("completed")
  async onCompleted(
    args: { jobId: string; returnvalue: string | null; prev?: string },
    id: string,
  ) {
    this.logger.log(`Copilot job ${args.jobId} completed`);

    if (!args.returnvalue) {
      this.logger.warn("No return value from copilot job");
      return;
    }

    const messageId = args.returnvalue;
    const [message] = await this.drizzle.db
      .select()
      .from(schema.chatMessage)
      .where(eq(schema.chatMessage.id, messageId))
      .limit(1);

    if (!message) {
      this.logger.error(`Message not found: ${messageId}`);
      return;
    }

    if (this.chatGateway.server) {
      this.logger.log(`Emitting message to room ${message.roomId}`);
      this.chatGateway.server.to(`room:${message.roomId}`).emit("message:new", {
        id: message.id,
        roomId: message.roomId,
        senderId: COPILOT_USER_ID,
        senderName: "Copilot",
        senderEmail: "copilot@converge.local",
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      });
    } else {
      this.logger.warn("ChatGateway server not available");
    }
  }

  @OnQueueEvent("failed")
  async onFailed(
    args: { jobId: string; failedReason: string; prev?: string },
    id: string,
  ) {
    this.logger.error(`Copilot job ${args.jobId} failed: ${args.failedReason}`);
  }
}
