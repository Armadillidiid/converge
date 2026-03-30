import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
  Delete,
} from "@nestjs/common";
import type { Request } from "express";
import { ChatService } from "./chat.service.js";
import { AuthGuard } from "#src/modules/better-auth/guards/auth.guard.js";
import { ChatMembershipGuard } from "./chat.guard.js";
import type { UserSession } from "#src/modules/better-auth/guards/auth.guard.js";

interface CreateRoomDto {
  name: string;
}

interface CreateMessageDto {
  content: string;
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

  @Get("rooms/:id/messages")
  @UseGuards(ChatMembershipGuard)
  async getMessages(
    @Param("id") roomId: string,
    @Body() body: { limit?: number; cursor?: string | undefined },
  ) {
    const messages = await this.chatService.getMessages(roomId, {
      limit: body.limit ?? 50,
      cursor: body.cursor,
    });
    return { success: true, data: messages };
  }

  @Post("rooms/:id/messages")
  @UseGuards(ChatMembershipGuard)
  async createMessage(
    @Req() req: Request & { user: UserSession },
    @Param("id") roomId: string,
    @Body() body: CreateMessageDto,
  ) {
    const message = await this.chatService.createMessage(
      req.user.user.id,
      roomId,
      body,
    );
    return { success: true, data: message };
  }

  @Post("rooms/:id/invite")
  async inviteMember(
    @Req() req: Request & { user: UserSession },
    @Param("id") roomId: string,
    @Body() body: { inviteeId: string },
  ) {
    const invitation = await this.chatService.inviteMember(
      req.user.user.id,
      roomId,
      body.inviteeId,
    );
    return { success: true, data: invitation };
  }

  @Get("invitations")
  async getInvitations(@Req() req: Request & { user: UserSession }) {
    const invitations = await this.chatService.getInvitations(req.user.user.id);
    return { success: true, data: invitations };
  }

  @Post("invitations/:id/accept")
  async acceptInvitation(
    @Req() req: Request & { user: UserSession },
    @Param("id") invitationId: string,
  ) {
    const invitation = await this.chatService.acceptInvitation(
      req.user.user.id,
      invitationId,
    );
    return { success: true, data: invitation };
  }

  @Post("invitations/:id/decline")
  async declineInvitation(
    @Req() req: Request & { user: UserSession },
    @Param("id") invitationId: string,
  ) {
    const invitation = await this.chatService.declineInvitation(
      req.user.user.id,
      invitationId,
    );
    return { success: true, data: invitation };
  }

  @Post("rooms/:id/leave")
  @UseGuards(ChatMembershipGuard)
  async leaveRoom(
    @Req() req: Request & { user: UserSession },
    @Param("id") roomId: string,
  ) {
    await this.chatService.leaveRoom(req.user.user.id, roomId);
    return { success: true };
  }

  @Delete("rooms/:id")
  async deleteRoom(@Param("id") roomId: string) {
    await this.chatService.deleteRoom(roomId);
    return { success: true };
  }
}
