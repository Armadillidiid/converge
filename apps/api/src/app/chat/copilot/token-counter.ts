import { encoding_for_model, type Tiktoken } from "tiktoken";

export class TokenCounter {
  private encoder: Tiktoken;

  constructor() {
    this.encoder = encoding_for_model("gpt-5-mini");
  }

  countTokens(text: string): number {
    return this.encoder.encode(text).length;
  }

  countMessagesTokens(
    messages: Array<{ role: string; content: string }>,
  ): number {
    return messages.reduce((sum, msg) => {
      return sum + this.countTokens(msg.content) + 4;
    }, 0);
  }

  dispose(): void {
    this.encoder.free();
  }
}
