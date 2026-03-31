import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Param,
  Delete,
  UsePipes,
} from "@nestjs/common";
import { z } from "zod";
import { ChatService } from "./chat.service.js";
import { AuthGuard } from "#src/modules/better-auth/guards/auth.guard.js";
import { Session } from "#src/modules/better-auth/decorators.js";
import { ChatMembershipGuard } from "./chat.guard.js";
import type { UserSession } from "#src/modules/better-auth/guards/auth.guard.js";
import { ZodValidationPipe } from "#src/lib/validation-pipe.js";
import { chatSchemas } from "./chat.contract.js";
import * as dto from "./chat.dto.js";

@Controller("chat")
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("rooms")
  @UsePipes(new ZodValidationPipe(chatSchemas.createRoomSchema))
  async createRoom(
    @Session() session: UserSession,
    @Body() body: z.infer<typeof chatSchemas.createRoomSchema>,
  ): Promise<z.infer<typeof dto.roomDto>> {
    return this.chatService.createRoom(session.user.id, body);
  }

  @Get("rooms")
  async getRooms(
    @Session() session: UserSession,
  ): Promise<z.infer<typeof dto.roomListDto>> {
    const rooms = await this.chatService.getRooms(session.user.id);
    return { items: rooms };
  }

  @Get("rooms/:id")
  @UseGuards(ChatMembershipGuard)
  async getRoom(
    @Session() session: UserSession,
    @Param("id") roomId: string,
  ): Promise<z.infer<typeof dto.roomWithMembersDto>> {
    const room = await this.chatService.getRoom(session.user.id, roomId);
    if (!room) {
      throw new Error("Room not found");
    }
    return room;
  }

  @Get("rooms/:id/members")
  @UseGuards(ChatMembershipGuard)
  async getMembers(
    @Param("id") roomId: string,
  ): Promise<z.infer<typeof dto.memberListDto>> {
    const members = await this.chatService.getMembers(roomId);
    return { items: members };
  }

  @Get("rooms/:id/messages")
  @UseGuards(ChatMembershipGuard)
  async getMessages(
    @Param("id") roomId: string,
    @Query() query: z.infer<typeof chatSchemas.getMessagesSchema>,
  ): Promise<z.infer<typeof dto.paginatedMessagesDto>> {
    return this.chatService.getMessages(roomId, {
      limit: query.limit ?? 50,
      cursor: query.cursor,
    });
  }

  @Post("rooms/:id/messages")
  @UseGuards(ChatMembershipGuard)
  @UsePipes(new ZodValidationPipe(chatSchemas.createMessageSchema))
  async createMessage(
    @Session() session: UserSession,
    @Param("id") roomId: string,
    @Body() body: z.infer<typeof chatSchemas.createMessageSchema>,
  ): Promise<z.infer<typeof dto.messageDto>> {
    return this.chatService.createMessage(session.user.id, roomId, body);
  }

  @Post("rooms/:id/invite")
  @UsePipes(new ZodValidationPipe(chatSchemas.inviteMemberSchema))
  async inviteMember(
    @Session() session: UserSession,
    @Param("id") roomId: string,
    @Body() body: z.infer<typeof chatSchemas.inviteMemberSchema>,
  ): Promise<z.infer<typeof dto.invitationDto>> {
    return this.chatService.inviteMember(session.user.id, roomId, body.email);
  }

  @Get("invitations")
  async getInvitations(
    @Session() session: UserSession,
  ): Promise<z.infer<typeof dto.invitationListDto>> {
    const invitations = await this.chatService.getInvitations(session.user.id);
    return { items: invitations };
  }

  @Post("invitations/:id/accept")
  async acceptInvitation(
    @Session() session: UserSession,
    @Param("id") invitationId: string,
  ): Promise<z.infer<typeof dto.invitationDto>> {
    return this.chatService.acceptInvitation(session.user.id, invitationId);
  }

  @Post("invitations/:id/decline")
  async declineInvitation(
    @Session() session: UserSession,
    @Param("id") invitationId: string,
  ): Promise<z.infer<typeof dto.invitationDto>> {
    return this.chatService.declineInvitation(session.user.id, invitationId);
  }

  @Post("rooms/:id/leave")
  @UseGuards(ChatMembershipGuard)
  async leaveRoom(
    @Session() session: UserSession,
    @Param("id") roomId: string,
  ): Promise<z.infer<typeof dto.successDto>> {
    await this.chatService.leaveRoom(session.user.id, roomId);
    return { success: true };
  }

  @Delete("rooms/:id")
  async deleteRoom(
    @Param("id") roomId: string,
  ): Promise<z.infer<typeof dto.successDto>> {
    await this.chatService.deleteRoom(roomId);
    return { success: true };
  }
}
