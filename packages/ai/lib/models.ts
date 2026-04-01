import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { openai } from "@ai-sdk/openai";
import { keys } from "../keys.js";

const apiKey = keys().OPENAI_API_KEY;
const baseURL = keys().OPENAI_BASE_URL;

const provider = createOpenAICompatible({
  name: "custom",
  apiKey,
  baseURL,
});

type Models = {
  chat: typeof provider;
  transcription: (modelId?: string) => ReturnType<typeof provider>;
  speech: (modelId?: string) => ReturnType<typeof openai.speech>;
};

export const models: Models = {
  chat: provider,
  transcription: (modelId = "whisper-1") => provider(modelId),
  speech: (modelId = "tts-1") => openai.speech(modelId),
};
