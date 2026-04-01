import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { DrizzleService } from "#src/modules/drizzle/drizzle.service.js";
import { eq, desc, and, gt, lt, or, isNull } from "@repo/database";
import { schema } from "@repo/database";
import { models, generateText } from "@repo/ai";
import {
  COMPACTION_QUEUE,
  COMPACTION_JOB,
  compactionJobSchema,
} from "./compaction.types.js";
import { TokenCounter } from "./token-counter.js";
import {
  COPILOT_MODEL_ID,
  COPILOT_TOKENIZER_MODEL_ID,
  COPILOT_CONTEXT_PERCENTAGE,
  COPILOT_CONTEXT_FALLBACK,
} from "./constants.js";

const SUMMARY_PROMPT = `Summarize the following conversation in a way that preserves important context for continuing the discussion. Include:

- Key decisions or agreements made
- Important facts or information shared  
- Active topics or threads
- Any open questions or pending tasks

Keep the summary concise but informative. Focus on information that would be useful for an AI assistant to know when responding to future messages.

Conversation:
{ messages }

Provide your summary below:`;

const COMPACTION_THRESHOLD = 0.7;
const COMPACTION_BUFFER = 20_000;
const MAX_MESSAGES_FOR_SUMMARY = 100;

interface SummaryRecord {
  id: string;
  roomId: string;
  content: string;
  startMessageId: string | null;
  endMessageId: string | null;
  tokenCount: string | null;
  createdAt: Date;
}

@Injectable()
export class CompactionService {
  private readonly logger = new Logger(CompactionService.name);
  private tokenCounter: TokenCounter;

  constructor(
    private readonly drizzle: DrizzleService,
    @InjectQueue(COMPACTION_QUEUE) private readonly compactionQueue: Queue,
  ) {
    this.tokenCounter = new TokenCounter(COPILOT_TOKENIZER_MODEL_ID);
  }

  async queueCompaction(roomId: string): Promise<void> {
    const job = compactionJobSchema.parse({ roomId });
    await this.compactionQueue.add(COMPACTION_JOB, job, {
      attempts: 1,
      removeOnComplete: true,
    });
    this.logger.log(`Queued compaction for room ${roomId}`);
  }

  async shouldCompact(roomId: string): Promise<boolean> {
    const contextLimit = await this.getContextLimit();
    const threshold = contextLimit * COMPACTION_THRESHOLD;

    const latestSummary = await this.getLatestSummary(roomId);
    const sinceDate = latestSummary?.createdAt ?? new Date(0);

    const messages = await this.drizzle.db
      .select({
        id: schema.chatMessage.id,
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
      .limit(MAX_MESSAGES_FOR_SUMMARY);

    if (messages.length < 10) return false;

    let totalTokens = 0;
    for (const msg of messages) {
      totalTokens += this.tokenCounter.countTokens(msg.content) + 4;
    }

    return totalTokens >= threshold;
  }

  async generateSummary(
    roomId: string,
    messages: Array<{ senderId: string; content: string; createdAt: Date }>,
  ): Promise<string> {
    const formattedMessages = messages
      .map((m) => `[${m.senderId}]: ${m.content}`)
      .join("\n");

    const prompt = SUMMARY_PROMPT.replace("{ messages }", formattedMessages);

    const result = await generateText({
      model: models.chat(COPILOT_MODEL_ID),
      messages: [{ role: "user" as const, content: prompt }],
    });

    return result.text;
  }

  async saveSummary(
    roomId: string,
    summary: string,
    startMessageId: string | null,
    endMessageId: string | null,
  ): Promise<void> {
    const tokenCount = this.tokenCounter.countTokens(summary);

    await this.drizzle.db.insert(schema.chatMessageSummary).values({
      roomId,
      content: summary,
      startMessageId,
      endMessageId,
      tokenCount: String(tokenCount),
    });

    this.logger.log(`Saved summary for room ${roomId} (${tokenCount} tokens)`);
  }

  async getLatestSummary(roomId: string): Promise<SummaryRecord | null> {
    const [summary] = await this.drizzle.db
      .select()
      .from(schema.chatMessageSummary)
      .where(eq(schema.chatMessageSummary.roomId, roomId))
      .orderBy(desc(schema.chatMessageSummary.createdAt))
      .limit(1);

    return summary ?? null;
  }

  async getMessagesSinceSummary(
    roomId: string,
    summaryCreatedAt: Date,
  ): Promise<
    Array<{ id: string; senderId: string; content: string; createdAt: Date }>
  > {
    const messages = await this.drizzle.db
      .select({
        id: schema.chatMessage.id,
        senderId: schema.chatMessage.senderId,
        content: schema.chatMessage.content,
        createdAt: schema.chatMessage.createdAt,
      })
      .from(schema.chatMessage)
      .where(
        and(
          eq(schema.chatMessage.roomId, roomId),
          gt(schema.chatMessage.createdAt, summaryCreatedAt),
        ),
      )
      .orderBy(schema.chatMessage.createdAt);

    return messages;
  }

  async getContextLimit(): Promise<number> {
    const fallback = COPILOT_CONTEXT_FALLBACK;
    return Math.floor(fallback * COPILOT_CONTEXT_PERCENTAGE);
  }
}
