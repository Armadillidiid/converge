import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { experimental_transcribe, experimental_generateSpeech } from "ai";
import { models } from "@repo/ai";
import { AuthGuard } from "#src/modules/better-auth/guards/auth.guard.js";
import { Session } from "#src/modules/better-auth/decorators.js";
import type { UserSession } from "#src/modules/better-auth/guards/auth.guard.js";
import { type SpeakInput, type TranscribeInput } from "./ai-voice.contract.js";

@Controller("ai/voice")
@UseGuards(AuthGuard)
export class AiVoiceController {
  @Post("transcribe")
  async transcribe(
    @Session() _session: UserSession,
    @Body() body: TranscribeInput,
  ): Promise<{ text: string }> {
    const audioBuffer = Buffer.from(body.audio, "base64");

    const result = await experimental_transcribe({
      model: models.transcription("whisper-1"),
      audio: audioBuffer,
    });

    return { text: result.text };
  }

  @Post("speak")
  async speak(
    @Session() _session: UserSession,
    @Body() body: SpeakInput,
  ): Promise<{ audio: string }> {
    const result = await experimental_generateSpeech({
      model: models.speech("tts-1"),
      text: body.text,
      voice: body.voice ?? "alloy",
    });

    return { audio: result.audio.base64 };
  }
}
