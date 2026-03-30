import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
  Delete,
} from "@nestjs/common";
import { z } from "zod";
import { ChatService } from "./chat.service.js";
import { AuthGuard } from "#src/modules/better-auth/guards/auth.guard.js";
import { Session } from "#src/modules/better-auth/decorators.js";
import { ChatMembershipGuard } from "./chat.guard.js";
import type { UserSession } from "#src/modules/better-auth/guards/auth.guard.js";
import {
  createRoomSchema,
  createMessageSchema,
  inviteMemberSchema,
  getMessagesSchema,
  roomSchema,
  roomWithMembersSchema,
  roomMemberSchema,
  paginatedMessagesSchema,
  messageSchema,
  invitationSchema,
} from "./chat.contract.js";

@Controller("chat")
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("rooms")
  async createRoom(
    @Session() session: UserSession,
    @Body() body: unknown,
  ): Promise<z.infer<typeof roomSchema>> {
    const data = createRoomSchema.parse(body);
    return this.chatService.createRoom(session.user.id, data);
  }

  @Get("rooms")
  async getRooms(
    @Session() session: UserSession,
  ): Promise<z.infer<typeof roomSchema>[]> {
    return this.chatService.getRooms(session.user.id);
  }

  @Get("rooms/:id")
  @UseGuards(ChatMembershipGuard)
  async getRoom(
    @Session() session: UserSession,
    @Param("id") roomId: string,
  ): Promise<z.infer<typeof roomWithMembersSchema>> {
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
  ): Promise<z.infer<typeof roomMemberSchema>[]> {
    return this.chatService.getMembers(roomId);
  }

  @Get("rooms/:id/messages")
  @UseGuards(ChatMembershipGuard)
  async getMessages(
    @Param("id") roomId: string,
    @Body() body: unknown,
  ): Promise<z.infer<typeof paginatedMessagesSchema>> {
    const data = getMessagesSchema.parse(body);
    return this.chatService.getMessages(roomId, {
      limit: data.limit ?? 50,
      cursor: data.cursor,
    });
  }

  @Post("rooms/:id/messages")
  @UseGuards(ChatMembershipGuard)
  async createMessage(
    @Session() session: UserSession,
    @Param("id") roomId: string,
    @Body() body: unknown,
  ): Promise<z.infer<typeof messageSchema>> {
    const data = createMessageSchema.parse(body);
    return this.chatService.createMessage(session.user.id, roomId, data);
  }

  @Post("rooms/:id/invite")
  async inviteMember(
    @Session() session: UserSession,
    @Param("id") roomId: string,
    @Body() body: unknown,
  ): Promise<z.infer<typeof invitationSchema>> {
    const data = inviteMemberSchema.parse(body);
    return this.chatService.inviteMember(
      session.user.id,
      roomId,
      data.inviteeId,
    );
  }

  @Get("invitations")
  async getInvitations(
    @Session() session: UserSession,
  ): Promise<z.infer<typeof invitationSchema>[]> {
    return this.chatService.getInvitations(session.user.id);
  }

  @Post("invitations/:id/accept")
  async acceptInvitation(
    @Session() session: UserSession,
    @Param("id") invitationId: string,
  ): Promise<z.infer<typeof invitationSchema>> {
    return this.chatService.acceptInvitation(session.user.id, invitationId);
  }

  @Post("invitations/:id/decline")
  async declineInvitation(
    @Session() session: UserSession,
    @Param("id") invitationId: string,
  ): Promise<z.infer<typeof invitationSchema>> {
    return this.chatService.declineInvitation(session.user.id, invitationId);
  }

  @Post("rooms/:id/leave")
  @UseGuards(ChatMembershipGuard)
  async leaveRoom(
    @Session() session: UserSession,
    @Param("id") roomId: string,
  ): Promise<void> {
    await this.chatService.leaveRoom(session.user.id, roomId);
  }

  @Delete("rooms/:id")
  async deleteRoom(@Param("id") roomId: string): Promise<void> {
    await this.chatService.deleteRoom(roomId);
  }
}
