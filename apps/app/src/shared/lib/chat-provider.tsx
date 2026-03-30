"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import {
  getSocket,
  connectSocket,
  disconnectSocket,
  resetSocket,
} from "./socket-client";
import { auth } from "@/shared/lib/auth";

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { data: session } = auth.useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (session?.user) {
      resetSocket();
      connectSocket();
      const s = getSocket();
      setSocket(s);

      s.on("connect", () => {
        setIsConnected(true);
      });

      s.on("disconnect", () => {
        setIsConnected(false);
      });

      return () => {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      resetSocket();
      setSocket(null);
      setIsConnected(false);
    }
  }, [session?.user]);

  return (
    <ChatContext.Provider value={{ socket, isConnected }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return ctx;
}
