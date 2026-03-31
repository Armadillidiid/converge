import { z } from "zod";

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

export const clientToServerEventNameEnum = z.enum(CHAT_EVENTS);

export const serverToClientEventNameEnum = z.enum(CHAT_EVENTS);

export const wsJoinRoomInputSchema = z.object({
  roomId: z.string(),
});

export const wsLeaveRoomInputSchema = z.object({
  roomId: z.string(),
});

export const wsSendMessageInputSchema = z.object({
  roomId: z.string(),
  content: z.string().min(1).max(5000),
});

export const wsTypingInputSchema = z.object({
  roomId: z.string(),
});

export const wsMessageNewOutputSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderEmail: z.string(),
  content: z.string(),
  createdAt: z.string(),
});

export const wsUserPresenceOutputSchema = z.object({
  userId: z.string(),
  userName: z.string().optional(),
  roomId: z.string(),
  status: z.enum(["online", "offline"]),
});

export const wsUserTypingOutputSchema = z.object({
  userId: z.string(),
  userName: z.string().optional(),
  roomId: z.string(),
  isTyping: z.boolean(),
});

export const wsErrorOutputSchema = z.object({
  message: z.string(),
});

export type ClientToServerEventName = z.infer<
  typeof clientToServerEventNameEnum
>;
export type ServerToClientEventName = z.infer<
  typeof serverToClientEventNameEnum
>;
export type WsJoinRoomInput = z.infer<typeof wsJoinRoomInputSchema>;
export type WsLeaveRoomInput = z.infer<typeof wsLeaveRoomInputSchema>;
export type WsSendMessageInput = z.infer<typeof wsSendMessageInputSchema>;
export type WsTypingInput = z.infer<typeof wsTypingInputSchema>;
export type WsMessageNewOutput = z.infer<typeof wsMessageNewOutputSchema>;
export type WsUserPresenceOutput = z.infer<typeof wsUserPresenceOutputSchema>;
export type WsUserTypingOutput = z.infer<typeof wsUserTypingOutputSchema>;
export type WsErrorOutput = z.infer<typeof wsErrorOutputSchema>;
