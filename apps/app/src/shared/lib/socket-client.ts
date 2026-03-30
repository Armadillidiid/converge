import { io, Socket } from "socket.io-client";
import { env } from "@/env";
import { readAuthTokenFromDocumentCookie } from "@/shared/lib/auth-token-cookie";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = readAuthTokenFromDocumentCookie();
    // Using auth query param instead of headers because Native WebSocket API doesn't support custom headers
    socket = io(`${env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
      auth: { token: token ?? "" },
    });
  }
  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export function resetSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
