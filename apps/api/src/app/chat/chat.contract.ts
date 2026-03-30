import { oc } from "@orpc/contract";
import { z } from "zod";
import * as dto from "./chat.dto.js";

export const chatContract = {
  createRoom: oc
    .route({ method: "POST", path: "/chat/rooms" })
    .input(dto.createRoomSchema)
    .output(dto.roomDto),

  getRooms: oc
    .route({ method: "GET", path: "/chat/rooms" })
    .input(z.object({}).optional())
    .output(dto.roomListDto),

  getRoom: oc
    .route({ method: "GET", path: "/chat/rooms/{id}" })
    .input(dto.pathIdParam)
    .output(dto.roomWithMembersDto),

  getMembers: oc
    .route({ method: "GET", path: "/chat/rooms/{id}/members" })
    .input(dto.pathIdParam)
    .output(dto.memberListDto),

  getMessages: oc
    .route({ method: "GET", path: "/chat/rooms/{id}/messages" })
    .input(dto.getMessagesSchema.extend(dto.pathIdParam.shape))
    .output(dto.paginatedMessagesDto),

  createMessage: oc
    .route({ method: "POST", path: "/chat/rooms/{id}/messages" })
    .input(dto.createMessageSchema.extend(dto.pathIdParam.shape))
    .output(dto.messageDto),

  inviteMember: oc
    .route({ method: "POST", path: "/chat/rooms/{id}/invite" })
    .input(dto.inviteMemberSchema.extend(dto.pathIdParam.shape))
    .output(dto.invitationDto),

  getInvitations: oc
    .route({ method: "GET", path: "/chat/invitations" })
    .input(z.object({}).optional())
    .output(dto.invitationListDto),

  acceptInvitation: oc
    .route({ method: "POST", path: "/chat/invitations/{id}/accept" })
    .input(dto.pathIdParam)
    .output(dto.invitationDto),

  declineInvitation: oc
    .route({ method: "POST", path: "/chat/invitations/{id}/decline" })
    .input(dto.pathIdParam)
    .output(dto.invitationDto),

  leaveRoom: oc
    .route({ method: "POST", path: "/chat/rooms/{id}/leave" })
    .input(dto.pathIdParam)
    .output(dto.successDto),

  deleteRoom: oc
    .route({ method: "DELETE", path: "/chat/rooms/{id}" })
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
