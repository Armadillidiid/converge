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

interface SuccessResponse<T> {
  success: true;
  data: T;
}

@Controller("chat")
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("rooms")
  async createRoom(
    @Session() session: UserSession,
    @Body() body: unknown,
  ): Promise<SuccessResponse<z.infer<typeof roomSchema>>> {
    const data = createRoomSchema.parse(body);
    const room = await this.chatService.createRoom(session.user.id, data);
    return {
      success: true,
      data: room as unknown as z.infer<typeof roomSchema>,
    };
  }

  @Get("rooms")
  async getRooms(
    @Session() session: UserSession,
  ): Promise<SuccessResponse<z.infer<typeof roomSchema>[]>> {
    const rooms = await this.chatService.getRooms(session.user.id);
    return {
      success: true,
      data: rooms as unknown as z.infer<typeof roomSchema>[],
    };
  }

  @Get("rooms/:id")
  @UseGuards(ChatMembershipGuard)
  async getRoom(
    @Session() session: UserSession,
    @Param("id") roomId: string,
  ): Promise<SuccessResponse<z.infer<typeof roomWithMembersSchema>>> {
    const room = await this.chatService.getRoom(session.user.id, roomId);
    return {
      success: true,
      data: room as unknown as z.infer<typeof roomWithMembersSchema>,
    };
  }

  @Get("rooms/:id/members")
  @UseGuards(ChatMembershipGuard)
  async getMembers(
    @Param("id") roomId: string,
  ): Promise<SuccessResponse<z.infer<typeof roomMemberSchema>[]>> {
    const members = await this.chatService.getMembers(roomId);
    return {
      success: true,
      data: members as unknown as z.infer<typeof roomMemberSchema>[],
    };
  }

  @Get("rooms/:id/messages")
  @UseGuards(ChatMembershipGuard)
  async getMessages(
    @Param("id") roomId: string,
    @Body() body: unknown,
  ): Promise<SuccessResponse<z.infer<typeof paginatedMessagesSchema>>> {
    const data = getMessagesSchema.parse(body);
    const messages = await this.chatService.getMessages(roomId, {
      limit: data.limit ?? 50,
      cursor: data.cursor,
    });
    return {
      success: true,
      data: messages as unknown as z.infer<typeof paginatedMessagesSchema>,
    };
  }

  @Post("rooms/:id/messages")
  @UseGuards(ChatMembershipGuard)
  async createMessage(
    @Session() session: UserSession,
    @Param("id") roomId: string,
    @Body() body: unknown,
  ): Promise<SuccessResponse<z.infer<typeof messageSchema>>> {
    const data = createMessageSchema.parse(body);
    const message = await this.chatService.createMessage(
      session.user.id,
      roomId,
      data,
    );
    return {
      success: true,
      data: message as unknown as z.infer<typeof messageSchema>,
    };
  }

  @Post("rooms/:id/invite")
  async inviteMember(
    @Session() session: UserSession,
    @Param("id") roomId: string,
    @Body() body: unknown,
  ): Promise<SuccessResponse<z.infer<typeof invitationSchema>>> {
    const data = inviteMemberSchema.parse(body);
    const invitation = await this.chatService.inviteMember(
      session.user.id,
      roomId,
      data.inviteeId,
    );
    return {
      success: true,
      data: invitation as unknown as z.infer<typeof invitationSchema>,
    };
  }

  @Get("invitations")
  async getInvitations(
    @Session() session: UserSession,
  ): Promise<SuccessResponse<z.infer<typeof invitationSchema>[]>> {
    const invitations = await this.chatService.getInvitations(session.user.id);
    return {
      success: true,
      data: invitations as unknown as z.infer<typeof invitationSchema>[],
    };
  }

  @Post("invitations/:id/accept")
  async acceptInvitation(
    @Session() session: UserSession,
    @Param("id") invitationId: string,
  ): Promise<SuccessResponse<z.infer<typeof invitationSchema>>> {
    const invitation = await this.chatService.acceptInvitation(
      session.user.id,
      invitationId,
    );
    return {
      success: true,
      data: invitation as unknown as z.infer<typeof invitationSchema>,
    };
  }

  @Post("invitations/:id/decline")
  async declineInvitation(
    @Session() session: UserSession,
    @Param("id") invitationId: string,
  ): Promise<SuccessResponse<z.infer<typeof invitationSchema>>> {
    const invitation = await this.chatService.declineInvitation(
      session.user.id,
      invitationId,
    );
    return {
      success: true,
      data: invitation as unknown as z.infer<typeof invitationSchema>,
    };
  }

  @Post("rooms/:id/leave")
  @UseGuards(ChatMembershipGuard)
  async leaveRoom(
    @Session() session: UserSession,
    @Param("id") roomId: string,
  ): Promise<{ success: true }> {
    await this.chatService.leaveRoom(session.user.id, roomId);
    return { success: true };
  }

  @Delete("rooms/:id")
  async deleteRoom(@Param("id") roomId: string): Promise<{ success: true }> {
    await this.chatService.deleteRoom(roomId);
    return { success: true };
  }
}
