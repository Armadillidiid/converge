import { Module } from "@nestjs/common";
import { AuthModule } from "#src/modules/auth/auth.module.js";
import { AiVoiceController } from "./ai-voice.controller.js";

@Module({
  imports: [AuthModule],
  controllers: [AiVoiceController],
})
export class AiModule {}
