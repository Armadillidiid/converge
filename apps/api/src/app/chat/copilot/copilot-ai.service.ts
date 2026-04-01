import { Injectable, Logger } from "@nestjs/common";
import { models, generateText } from "@repo/ai";
import { DrizzleService } from "#src/modules/drizzle/drizzle.service.js";
import { eq, desc, and, gt } from "@repo/database";
import { schema } from "@repo/database";
import { COPILOT_USER_ID } from "@repo/database/constants";
import {
  SYSTEM_PROMPT,
  COPILOT_CONTEXT_PERCENTAGE,
  COPILOT_CONTEXT_FALLBACK,
  COPILOT_MODEL_ID,
  MAX_MESSAGES_FETCH,
  COPILOT_TOKENIZER_MODEL_ID,
} from "./constants.js";
import { TokenCounter } from "./token-counter.js";
import { ModelInfoService } from "./model-info.service.js";
import { CompactionService } from "./compaction.service.js";
import { SENDER_ID_COMPACTOR } from "./compaction.types.js";

interface ContextMessage {
  senderId: string;
  content: string;
  createdAt: Date;
}

@Injectable()
export class CopilotAiService {
  private readonly logger = new Logger(CopilotAiService.name);
  private tokenCounter: TokenCounter;

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly modelInfo: ModelInfoService,
    private readonly compactionService: CompactionService,
  ) {
    this.tokenCounter = new TokenCounter(COPILOT_TOKENIZER_MODEL_ID);
  }

  async buildContext(roomId: string): Promise<ContextMessage[]> {
    const contextLimit = await this.getContextLimit();

    const latestSummary = await this.compactionService.getLatestSummary(roomId);
    const sinceDate = latestSummary?.createdAt ?? new Date(0);

    const messages = await this.drizzle.db
      .select({
        senderId: schema.chatMessage.senderId,
        content: schema.chatMessage.content,
        createdAt: schema.chatMessage.createdAt,
      })
      .from(schema.chatMessage)
      .where(
        latestSummary
          ? and(
              eq(schema.chatMessage.roomId, roomId),
              gt(schema.chatMessage.createdAt, sinceDate),
            )
          : eq(schema.chatMessage.roomId, roomId),
      )
      .orderBy(desc(schema.chatMessage.createdAt))
      .limit(MAX_MESSAGES_FETCH);

    const context: ContextMessage[] = [];
    let totalTokens = 0;

    if (latestSummary) {
      const summaryTokens =
        this.tokenCounter.countTokens(latestSummary.content) + 4;
      context.push({
        senderId: SENDER_ID_COMPACTOR,
        content: `[Previous conversation summary]\n${latestSummary.content}`,
        createdAt: latestSummary.createdAt,
      });
      totalTokens += summaryTokens;
    }

    for (const msg of messages) {
      const msgTokens = this.tokenCounter.countTokens(msg.content) + 4;
      if (totalTokens + msgTokens > contextLimit) {
        break;
      }
      context.push(msg);
      totalTokens += msgTokens;
    }

    const shouldCompact = await this.compactionService.shouldCompact(roomId);
    if (shouldCompact) {
      this.logger.log(`Queueing compaction for room ${roomId}`);
      await this.compactionService.queueCompaction(roomId);
    }

    return context.reverse();
  }

  async generateResponse(
    context: ContextMessage[],
    userMessage: string,
  ): Promise<string> {
    const messages = [
      {
        role: "system" as const,
        content: SYSTEM_PROMPT,
      },
      ...context.map((msg) => ({
        role: (msg.senderId === COPILOT_USER_ID ? "assistant" : "user") as
          | "assistant"
          | "user",
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    const result = await generateText({
      model: models.chat(COPILOT_MODEL_ID),
      messages,
    });

    return result.text;
  }

  private async getContextLimit(): Promise<number> {
    const modelInfo = await this.modelInfo.getModel(COPILOT_MODEL_ID);
    const contextLimit = modelInfo?.limit?.context ?? COPILOT_CONTEXT_FALLBACK;
    return Math.floor(contextLimit * COPILOT_CONTEXT_PERCENTAGE);
  }
}
