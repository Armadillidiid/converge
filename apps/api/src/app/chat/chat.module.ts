import { Module } from "@nestjs/common";
import { DrizzleModule } from "#src/modules/drizzle/drizzle.module.js";
import { ChatController } from "./chat.controller.js";
import { ChatService } from "./chat.service.js";

@Module({
  imports: [DrizzleModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
