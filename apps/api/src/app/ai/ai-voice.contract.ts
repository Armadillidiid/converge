import { z } from "zod";
import { oc } from "@orpc/contract";
import { aiVoiceSchemas } from "./ai-voice.dto.js";

export const aiVoiceContract = {
  speak: oc
    .route({
      method: "POST",
      path: "/ai/voice/speak",
      description: "Convert text to speech",
    })
    .input(aiVoiceSchemas.speakSchemaInput)
    .output(aiVoiceSchemas.speakSchemaOutput),
  transcribe: oc
    .route({
      method: "POST",
      path: "/ai/voice/transcribe",
      description: "Convert speech to text",
    })
    .input(aiVoiceSchemas.transcribeSchemaInput)
    .output(aiVoiceSchemas.transcribeSchemaOutput),
};

export type SpeakInput = z.infer<typeof aiVoiceSchemas.speakSchemaInput>;
export type TranscribeInput = z.infer<
  typeof aiVoiceSchemas.transcribeSchemaInput
>;
export type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
