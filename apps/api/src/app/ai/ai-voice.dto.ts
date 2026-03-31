import { z } from "zod";

export const aiVoiceSchemas = {
  speakSchemaInput: z.object({
    text: z.string().min(1).max(4096),
    voice: z
      .enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
      .optional(),
  }),
  speakSchemaOutput: z.object({
    audio: z.string(),
  }),

  transcribeSchemaInput: z.object({
    audio: z.string(),
  }),
  transcribeSchemaOutput: z.object({
    text: z.string(),
  }),
};

export type SpeakInput = z.infer<typeof aiVoiceSchemas.speakSchemaInput>;
export type SpeakOutput = z.infer<typeof aiVoiceSchemas.speakSchemaOutput>;
export type TranscribeInput = z.infer<
  typeof aiVoiceSchemas.transcribeSchemaInput
>;
export type TranscribeOutput = z.infer<
  typeof aiVoiceSchemas.transcribeSchemaOutput
>;
export type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
