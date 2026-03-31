import { Injectable } from "@nestjs/common";
import { models, generateText } from "@repo/ai";
import { DrizzleService } from "#src/modules/drizzle/drizzle.service.js";
import { eq, desc } from "@repo/database";
import { schema } from "@repo/database";
import { COPILOT_USER_ID } from "@repo/database/constants";
import { SYSTEM_PROMPT, COPILOT_MAX_CONTEXT_TOKENS } from "./constants.js";
import { TokenCounter } from "./token-counter.js";

interface ContextMessage {
  senderId: string;
  content: string;
  createdAt: Date;
}

@Injectable()
export class CopilotAiService {
  private tokenCounter: TokenCounter;

  constructor(private readonly drizzle: DrizzleService) {
    this.tokenCounter = new TokenCounter();
  }

  async buildContext(roomId: string): Promise<ContextMessage[]> {
    const messages = await this.drizzle.db
      .select({
        senderId: schema.chatMessage.senderId,
        content: schema.chatMessage.content,
        createdAt: schema.chatMessage.createdAt,
      })
      .from(schema.chatMessage)
      .where(eq(schema.chatMessage.roomId, roomId))
      .orderBy(desc(schema.chatMessage.createdAt));

    const context: ContextMessage[] = [];
    let totalTokens = 0;

    for (const msg of messages) {
      const msgTokens = this.tokenCounter.countTokens(msg.content) + 4;
      if (totalTokens + msgTokens > COPILOT_MAX_CONTEXT_TOKENS) {
        break;
      }
      context.unshift(msg);
      totalTokens += msgTokens;
    }

    return context;
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
      model: models.chat("openai/gpt-4.1"),
      messages,
    });

    return result.text;
  }
}
