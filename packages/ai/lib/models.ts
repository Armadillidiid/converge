import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { keys } from "../keys.js";

const apiKey = keys().OPENAI_API_KEY;
const baseURL = keys().OPENAI_BASE_URL;

const provider = createOpenAICompatible({ name: "github", apiKey, baseURL });

export const models = {
  chat: provider,
};
