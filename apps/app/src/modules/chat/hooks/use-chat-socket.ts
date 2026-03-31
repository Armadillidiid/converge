"use client";

import { useEffect, useState, useCallback } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import type {
  NewMessageEvent,
  PresenceEvent,
  TypingEvent,
} from "../types/chat.types";
import { useChatContext } from "@/shared/lib/chat-provider";
import {
  chatGetPresenceOptions,
  chatGetTypingOptions,
} from "@repo/sdk/tanstack";
import { CHAT_EVENTS } from "../constants/chat.constant";

export function useChatSocket(roomId: string) {
  const { socket, isConnected } = useChatContext();
  const [newMessages, setNewMessages] = useState<NewMessageEvent[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(
    new Map(),
  );
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const { data: presenceData } = useSuspenseQuery(
    chatGetPresenceOptions({ path: { id: roomId } }),
  );
  const { data: typingData } = useSuspenseQuery(
    chatGetTypingOptions({ path: { id: roomId } }),
  );

  useEffect(() => {
    if (presenceData?.onlineUsers) {
      setOnlineUsers(new Set(presenceData.onlineUsers.map((u) => u.userId)));
    }
  }, [presenceData]);

  useEffect(() => {
    if (typingData?.typingUsers) {
      const map = new Map<string, string>();
      for (const u of typingData.typingUsers) {
        map.set(u.userId, u.userName);
      }
      setTypingUsers(map);
    }
  }, [typingData]);

  useEffect(() => {
    if (!socket || !isConnected || !roomId) return;

    socket.emit(CHAT_EVENTS.JOIN_ROOM, { roomId });

    const handleNewMessage = (msg: NewMessageEvent) => {
      if (msg.roomId === roomId) {
        setNewMessages((prev) => [...prev, msg]);
      }
    };

    const handlePresence = (data: PresenceEvent) => {
      if (data.roomId === roomId) {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          if (data.status === "online") {
            next.add(data.userId);
          } else {
            next.delete(data.userId);
          }
          return next;
        });
      }
    };

    const handleTyping = (data: TypingEvent) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          if (data.isTyping) {
            next.set(data.userId, data.userName ?? "");
          } else {
            next.delete(data.userId);
          }
          return next;
        });
      }
    };

    socket.on(CHAT_EVENTS.MESSAGE_NEW, handleNewMessage);
    socket.on(CHAT_EVENTS.USER_PRESENCE, handlePresence);
    socket.on(CHAT_EVENTS.USER_TYPING, handleTyping);

    return () => {
      socket.emit(CHAT_EVENTS.LEAVE_ROOM, { roomId });
      socket.off(CHAT_EVENTS.MESSAGE_NEW, handleNewMessage);
      socket.off(CHAT_EVENTS.USER_PRESENCE, handlePresence);
      socket.off(CHAT_EVENTS.USER_TYPING, handleTyping);
    };
  }, [socket, isConnected, roomId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (socket && isConnected && roomId) {
        socket.emit(CHAT_EVENTS.SEND_MESSAGE, { roomId, content });
      }
    },
    [socket, isConnected, roomId],
  );

  const sendTypingStart = useCallback(() => {
    if (socket && isConnected && roomId) {
      socket.emit(CHAT_EVENTS.TYPING_START, { roomId });
    }
  }, [socket, isConnected, roomId]);

  const sendTypingStop = useCallback(() => {
    if (socket && isConnected && roomId) {
      socket.emit(CHAT_EVENTS.TYPING_STOP, { roomId });
    }
  }, [socket, isConnected, roomId]);

  const clearNewMessages = useCallback(() => {
    setNewMessages([]);
  }, []);

  return {
    isConnected,
    newMessages,
    typingUsers: Array.from(typingUsers.entries()).map(([id, name]) => ({
      userId: id,
      userName: name,
    })),
    onlineUsers: Array.from(onlineUsers),
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    clearNewMessages,
  };
}
