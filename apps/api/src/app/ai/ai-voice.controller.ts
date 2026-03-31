import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UsePipes,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { experimental_transcribe, experimental_generateSpeech } from "ai";
import { models } from "@repo/ai";
import { AuthGuard } from "#src/modules/better-auth/guards/auth.guard.js";
import { Session } from "#src/modules/better-auth/decorators.js";
import type { UserSession } from "#src/modules/better-auth/guards/auth.guard.js";
import { aiVoiceSchemas } from "./ai-voice.dto.js";
import { ZodValidationPipe } from "#src/lib/validation-pipe.js";

interface AudioFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Controller("ai/voice")
@UseGuards(AuthGuard)
export class AiVoiceController {
  @Post("transcribe")
  @UseInterceptors(FileInterceptor("audio"))
  async transcribe(
    @Session() _session: UserSession,
    @UploadedFile() file: AudioFile | undefined,
  ): Promise<{ text: string }> {
    if (!file) {
      throw new Error("No audio file provided");
    }

    const result = await experimental_transcribe({
      model: models.transcription("whisper-1"),
      audio: file.buffer,
    });

    return { text: result.text };
  }

  @Post("speak")
  @UsePipes(new ZodValidationPipe(aiVoiceSchemas.speakSchemaInput))
  async speak(
    @Session() _session: UserSession,
    @Body() body: { text: string; voice?: string },
  ): Promise<{ audio: string }> {
    const result = await experimental_generateSpeech({
      model: models.speech("tts-1"),
      text: body.text,
      voice: body.voice ?? "alloy",
    });

    return { audio: result.audio.base64 };
  }
}
