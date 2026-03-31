import { z } from "zod";

export const copilotMessageJobSchema = z.object({
  messageId: z.string(),
  roomId: z.string(),
  senderId: z.string(),
  content: z.string().min(1),
});

export type CopilotMessageJob = z.infer<typeof copilotMessageJobSchema>;

export const COPILOT_QUEUE = "copilot-queue";
export const COPILOT_MESSAGE_JOB = "copilot-message";
