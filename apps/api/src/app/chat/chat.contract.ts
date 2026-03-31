import { oc } from "@orpc/contract";

function CHAT_EVENTS() {
  export const CHAT_EVENTS = {
    JOIN_ROOM: "join_room",
    LEAVE_ROOM: "leave_room",
    SEND_MESSAGE: "send_message",
    TYPING_START: "typing_start",
    TYPING_STOP: "typing_stop",
    HEARTBEAT: "heartbeat",
    MESSAGE_NEW: "message:new",
    USER_TYPING: "user:typing",
    USER_PRESENCE: "user:presence",
    MEMBER_JOINED: "member:joined",
    MEMBER_LEFT: "member:left",
    ROOM_DELETED: "room:deleted",
  } as const;
  return CHAT_EVENTS;
}

import { z } from "zod";
import * as dto from "./chat.dto.js";

export const chatContract = {
  createRoom: oc
    .route({
      method: "POST",
      path: "/chat/rooms",
      description: "Create a new chat room",
    })
    .input(dto.createRoomSchema)
    .output(dto.roomDto),

  getRooms: oc
    .route({
      method: "GET",
      path: "/chat/rooms",
      description: "List user's chat rooms (paginated)",
    })
    .input(z.object({}).optional())
    .output(dto.roomListDto),

  getRoom: oc
    .route({
      method: "GET",
      path: "/chat/rooms/{id}",
      description: "Get room details with members",
    })
    .input(dto.pathIdParam)
    .output(dto.roomWithMembersDto),

  getMembers: oc
    .route({
      method: "GET",
      path: "/chat/rooms/{id}/members",
      description: "List room members",
    })
    .input(dto.pathIdParam)
    .output(dto.memberListDto),

  getMessages: oc
    .route({
      method: "GET",
      path: "/chat/rooms/{id}/messages",
      description: "Get room messages (paginated)",
    })
    .input(dto.getMessagesSchema.extend(dto.pathIdParam.shape))
    .output(dto.paginatedMessagesDto),

  getPresence: oc
    .route({
      method: "GET",
      path: "/chat/rooms/{id}/presence",
      description: "Get online users in a room",
    })
    .input(dto.pathIdParam)
    .output(dto.presenceDto),

  getTyping: oc
    .route({
      method: "GET",
      path: "/chat/rooms/{id}/typing",
      description: "Get currently typing users in a room",
    })
    .input(dto.pathIdParam)
    .output(dto.typingDto),

  inviteMember: oc
    .route({
      method: "POST",
      path: "/chat/rooms/{id}/invite",
      description: "Invite user to room (owner only)",
    })
    .input(dto.inviteMemberSchema.extend(dto.pathIdParam.shape))
    .output(dto.invitationDto),

  getInvitations: oc
    .route({
      method: "GET",
      path: "/chat/invitations",
      description: "List user's pending invitations",
    })
    .input(z.object({}).optional())
    .output(dto.invitationListDto),

  acceptInvitation: oc
    .route({
      method: "POST",
      path: "/chat/invitations/{id}/accept",
      description: "Accept an invitation",
    })
    .input(dto.pathIdParam)
    .output(dto.invitationDto),

  declineInvitation: oc
    .route({
      method: "POST",
      path: "/chat/invitations/{id}/decline",
      description: "Decline an invitation",
    })
    .input(dto.pathIdParam)
    .output(dto.invitationDto),

  leaveRoom: oc
    .route({
      method: "POST",
      path: "/chat/rooms/{id}/leave",
      description: "Leave a room",
    })
    .input(dto.pathIdParam)
    .output(dto.successDto),

  deleteRoom: oc
    .route({
      method: "DELETE",
      path: "/chat/rooms/{id}",
      description: "Delete room (owner only)",
    })
    .input(dto.pathIdParam)
    .output(dto.successDto),
};

export const chatSchemas = {
  createRoomSchema: dto.createRoomSchema,
  createMessageSchema: dto.createMessageSchema,
  inviteMemberSchema: dto.inviteMemberSchema,
  getMessagesSchema: dto.getMessagesSchema,
  pathIdParam: dto.pathIdParam,
} as const;

export type Room = z.infer<typeof dto.roomDto>;
export type RoomWithMembers = z.infer<typeof dto.roomWithMembersDto>;
export type RoomMember = z.infer<typeof dto.roomMemberDto>;
export type Message = z.infer<typeof dto.messageDto>;
export type PaginatedMessages = z.infer<typeof dto.paginatedMessagesDto>;
export type Invitation = z.infer<typeof dto.invitationDto>;
export type CreateRoomInput = z.infer<typeof dto.createRoomSchema>;
export type CreateMessageInput = z.infer<typeof dto.createMessageSchema>;
