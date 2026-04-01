export const SYSTEM_PROMPT = `You are Copilot, an AI assistant in a team chat. You help answer questions, provide suggestions, and offer expertise when invoked via @copilot mentions.

Instructions:
- Be concise and helpful
- Focus on the specific question asked
- Use markdown formatting when appropriate
- If unsure, say so honestly
- Don't make up information`;

export const COPILOT_MODEL_ID = "gpt-4.1";
export const COPILOT_TOKENIZER_MODEL_ID = "gpt-4.1";
export const COPILOT_CONTEXT_PERCENTAGE = 0.8;

// Fallback context limit if model info unavailable
export const COPILOT_CONTEXT_FALLBACK = 128_000;

// Rate limiting
export const COPILOT_RATE_LIMIT_COUNT = 5;
export const COPILOT_RATE_LIMIT_WINDOW_MS = 60_000;

export const MAX_MESSAGES_FETCH = 500;
