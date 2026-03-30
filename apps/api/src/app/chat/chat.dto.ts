import { z } from "zod";

const dateToString = z
  .union([z.date(), z.string()])
  .transform((v) => (v instanceof Date ? v.toISOString() : v));

export const roomMemberDto = z.object({
  id: z.string(),
  userId: z.string(),
  role: z.enum(["owner", "member"]),
  joinedAt: dateToString,
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
});

export const roomDto = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  createdAt: dateToString,
  updatedAt: dateToString,
});

export const roomWithMembersDto = roomDto.extend({
  members: z.array(roomMemberDto),
});

export const roomListDto = z.object({
  items: z.array(roomDto),
});

export const memberListDto = z.object({
  items: z.array(roomMemberDto),
});

export const invitationDto = z.object({
  id: z.string(),
  roomId: z.string(),
  inviterId: z.string(),
  inviteeId: z.string(),
  status: z.enum(["pending", "accepted", "declined"]),
  expiresAt: dateToString,
  createdAt: dateToString,
});

export const invitationListDto = z.object({
  items: z.array(invitationDto),
});

export const messageDto = z.object({
  id: z.string(),
  roomId: z.string(),
  senderId: z.string(),
  content: z.string(),
  createdAt: dateToString,
});

export const paginatedMessagesDto = z.object({
  items: z.array(messageDto),
  nextCursor: z.string().optional(),
});

export const successDto = z.object({
  success: z.boolean(),
});

export const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
});

export const createMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const inviteMemberSchema = z.object({
  inviteeId: z.string().min(1),
});

export const getMessagesSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

export const pathIdParam = z.object({
  id: z.string(),
});

export type RoomDto = z.infer<typeof roomDto>;
export type RoomWithMembersDto = z.infer<typeof roomWithMembersDto>;
export type MemberDto = z.infer<typeof roomMemberDto>;
export type MessageDto = z.infer<typeof messageDto>;
export type PaginatedMessagesDto = z.infer<typeof paginatedMessagesDto>;
export type InvitationDto = z.infer<typeof invitationDto>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
