import { zClientToServerEventName, zServerToClientEventName } from "./zod.gen";

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

export const SERVER_CHAT_EVENTS = {
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

export type ClientToServerEventName =
  (typeof CHAT_EVENTS)[keyof typeof CHAT_EVENTS];
export type ServerToClientEventName =
  (typeof SERVER_CHAT_EVENTS)[keyof typeof SERVER_CHAT_EVENTS];
