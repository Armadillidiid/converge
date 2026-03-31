import type {
  WsMessageNewOutput,
  WsUserPresenceOutput,
  WsUserTypingOutput,
} from "@repo/sdk";

export type NewMessageEvent = WsMessageNewOutput & { senderEmail?: string };
export type PresenceEvent = WsUserPresenceOutput;
export type TypingEvent = WsUserTypingOutput;
