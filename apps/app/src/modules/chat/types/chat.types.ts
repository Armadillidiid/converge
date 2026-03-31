import type {
  WsMessageNewOutput,
  WsUserPresenceOutput,
  WsUserTypingOutput,
} from "@repo/sdk";

export type NewMessageEvent = WsMessageNewOutput;
export type PresenceEvent = WsUserPresenceOutput;
export type TypingEvent = WsUserTypingOutput;
