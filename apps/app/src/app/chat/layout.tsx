import { ChatProvider } from "@/shared/lib/chat-provider";
import type { ReactNode } from "react";

type ChatLayoutProperties = {
  readonly children: ReactNode;
};

export default function ChatLayout({ children }: ChatLayoutProperties) {
  return <ChatProvider>{children}</ChatProvider>;
}
