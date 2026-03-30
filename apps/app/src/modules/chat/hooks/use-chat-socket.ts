"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  NewMessageEvent,
  PresenceEvent,
  TypingEvent,
} from "../types/chat.types";
import { useChatContext } from "@/shared/lib/chat-provider";

export function useChatSocket(roomId: string) {
  const { socket, isConnected } = useChatContext();
  const [newMessages, setNewMessages] = useState<NewMessageEvent[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(
    new Map(),
  );
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!socket || !isConnected || !roomId) return;

    socket.emit("join_room", { roomId });

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
            next.set(data.userId, data.userName);
          } else {
            next.delete(data.userId);
          }
          return next;
        });
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("user:presence", handlePresence);
    socket.on("user:typing", handleTyping);

    return () => {
      socket.emit("leave_room", { roomId });
      socket.off("message:new", handleNewMessage);
      socket.off("user:presence", handlePresence);
      socket.off("user:typing", handleTyping);
    };
  }, [socket, isConnected, roomId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (socket && isConnected && roomId) {
        socket.emit("send_message", { roomId, content });
      }
    },
    [socket, isConnected, roomId],
  );

  const sendTypingStart = useCallback(() => {
    if (socket && isConnected && roomId) {
      socket.emit("typing_start", { roomId });
    }
  }, [socket, isConnected, roomId]);

  const sendTypingStop = useCallback(() => {
    if (socket && isConnected && roomId) {
      socket.emit("typing_stop", { roomId });
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
