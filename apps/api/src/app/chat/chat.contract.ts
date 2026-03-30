import { oc } from "@orpc/contract";
import { z } from "zod";

const dateToString = z
  .union([z.date(), z.string()])
  .transform((v) => (v instanceof Date ? v.toISOString() : v));

export const roomMemberSchema = z.object({
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

export const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  createdAt: dateToString,
  updatedAt: dateToString,
});

export const roomWithMembersSchema = roomSchema.extend({
  members: z.array(roomMemberSchema),
});

export const invitationSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  inviterId: z.string(),
  inviteeId: z.string(),
  status: z.enum(["pending", "accepted", "declined"]),
  expiresAt: dateToString,
  createdAt: dateToString,
});

export const messageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  senderId: z.string(),
  content: z.string(),
  createdAt: dateToString,
});

export const paginatedMessagesSchema = z.object({
  items: z.array(messageSchema),
  nextCursor: z.string().optional(),
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

export const chatContract = {
  createRoom: oc
    .route({ method: "POST", path: "/chat/rooms" })
    .input(createRoomSchema)
    .output(roomSchema),

  getRooms: oc
    .route({ method: "GET", path: "/chat/rooms" })
    .input(z.object({}).optional())
    .output(z.object({ items: z.array(roomSchema) })),

  getRoom: oc
    .route({ method: "GET", path: "/chat/rooms/{id}" })
    .input(z.object({ id: z.string() }))
    .output(roomWithMembersSchema),

  getMembers: oc
    .route({ method: "GET", path: "/chat/rooms/{id}/members" })
    .input(z.object({ id: z.string() }))
    .output(z.object({ items: z.array(roomMemberSchema) })),

  getMessages: oc
    .route({ method: "GET", path: "/chat/rooms/{id}/messages" })
    .input(getMessagesSchema.extend({ id: z.string() }))
    .output(paginatedMessagesSchema),

  createMessage: oc
    .route({ method: "POST", path: "/chat/rooms/{id}/messages" })
    .input(createMessageSchema.extend({ id: z.string() }))
    .output(messageSchema),

  inviteMember: oc
    .route({ method: "POST", path: "/chat/rooms/{id}/invite" })
    .input(inviteMemberSchema.extend({ id: z.string() }))
    .output(invitationSchema),

  getInvitations: oc
    .route({ method: "GET", path: "/chat/invitations" })
    .input(z.object({}).optional())
    .output(z.object({ items: z.array(invitationSchema) })),

  acceptInvitation: oc
    .route({ method: "POST", path: "/chat/invitations/{id}/accept" })
    .input(z.object({ id: z.string() }))
    .output(invitationSchema),

  declineInvitation: oc
    .route({ method: "POST", path: "/chat/invitations/{id}/decline" })
    .input(z.object({ id: z.string() }))
    .output(invitationSchema),

  leaveRoom: oc
    .route({ method: "POST", path: "/chat/rooms/{id}/leave" })
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() })),

  deleteRoom: oc
    .route({ method: "DELETE", path: "/chat/rooms/{id}" })
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() })),
};

export type Room = z.infer<typeof roomSchema>;
export type RoomWithMembers = z.infer<typeof roomWithMembersSchema>;
export type RoomMember = z.infer<typeof roomMemberSchema>;
export type Message = z.infer<typeof messageSchema>;
export type PaginatedMessages = z.infer<typeof paginatedMessagesSchema>;
export type Invitation = z.infer<typeof invitationSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
