import { z } from "zod";

export const clientToServerEventNameEnum = z.enum([
  "join_room",
  "leave_room",
  "send_message",
  "typing_start",
  "typing_stop",
  "heartbeat",
]);

export const serverToClientEventNameEnum = z.enum([
  "message:new",
  "user:typing",
  "user:presence",
  "member:joined",
  "member:left",
  "room:deleted",
]);

export const wsJoinRoomInputSchema = z.object({
  roomId: z.string().uuid(),
});

export const wsLeaveRoomInputSchema = z.object({
  roomId: z.string().uuid(),
});

export const wsSendMessageInputSchema = z.object({
  roomId: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

export const wsTypingInputSchema = z.object({
  roomId: z.string().uuid(),
});

export const wsMessageNewOutputSchema = z.object({
  roomId: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  content: z.string(),
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
