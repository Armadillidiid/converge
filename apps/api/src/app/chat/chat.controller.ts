import { Controller, Post, Get, Body, UseGuards, Req } from "@nestjs/common";
import type { Request } from "express";
import { ChatService } from "./chat.service.js";
import { AuthGuard } from "#src/modules/better-auth/guards/auth.guard.js";
import type { UserSession } from "#src/modules/better-auth/guards/auth.guard.js";

interface CreateRoomDto {
  name: string;
}

@Controller("chat")
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("rooms")
  async createRoom(
    @Req() req: Request & { user: UserSession },
    @Body() body: CreateRoomDto,
  ) {
    const room = await this.chatService.createRoom(req.user.user.id, body);
    return { success: true, data: room };
  }

  @Get("rooms")
  async getRooms(@Req() req: Request & { user: UserSession }) {
    const rooms = await this.chatService.getRooms(req.user.user.id);
    return { success: true, data: rooms };
  }
}
