// TODO: Convert this to a zod schema and infer type
export interface CopilotMessageJob {
  messageId: string;
  roomId: string;
  senderId: string;
  content: string;
}

export const COPILOT_QUEUE = "copilot-queue";
export const COPILOT_MESSAGE_JOB = "copilot-message";
