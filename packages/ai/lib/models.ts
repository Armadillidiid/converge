import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { keys } from "../keys.js";

const apiKey = keys().OPENAI_API_KEY;
const baseURL = keys().OPENAI_BASE_URL;

// Main chat provider
const provider = createOpenAICompatible({
  name: "custom",
  apiKey,
  baseURL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModelFunction = (modelId?: string) => any;

export const models: {
  chat: ReturnType<typeof createOpenAICompatible>;
  transcription: ModelFunction;
  speech: ModelFunction;
} = {
  chat: provider,
  transcription: (modelId = "whisper-1") => provider(modelId),
  speech: (modelId = "tts-1") => provider(modelId),
};
