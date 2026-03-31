import { Module } from "@nestjs/common";
import { AiVoiceController } from "./ai-voice.controller.js";

@Module({
  controllers: [AiVoiceController],
})
export class AiModule {}
