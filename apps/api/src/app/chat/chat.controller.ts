import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
} from "@nestjs/common";
import type { Request } from "express";
import { ChatService } from "./chat.service.js";
import { AuthGuard } from "#src/modules/better-auth/guards/auth.guard.js";
import { ChatMembershipGuard } from "./chat.guard.js";
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

  @Get("rooms/:id")
  @UseGuards(ChatMembershipGuard)
  async getRoom(
    @Req() req: Request & { user: UserSession },
    @Param("id") roomId: string,
  ) {
    const room = await this.chatService.getRoom(req.user.user.id, roomId);
    return { success: true, data: room };
  }

  @Get("rooms/:id/members")
  @UseGuards(ChatMembershipGuard)
  async getMembers(@Param("id") roomId: string) {
    const members = await this.chatService.getMembers(roomId);
    return { success: true, data: members };
  }
}
