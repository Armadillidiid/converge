"use client";

import { useEffect, useRef, useMemo } from "react";
import { useChatMessages } from "../hooks/use-chat-messages";
import { useChatSocket } from "../hooks/use-chat-socket";
import { useRoomMembers } from "../hooks/use-room-members";
import { MessageItem } from "./message-item";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";
import { MembersSidebar } from "./members-sidebar";
import { ScrollArea } from "@repo/design-system/components/ui/scroll-area";
import { auth } from "@/shared/lib/auth";

interface ChatViewProperties {
  roomId: string;
}

export function ChatView({ roomId }: ChatViewProperties) {
  const { data: session } = auth.useSession();
  const currentUserId = session?.user?.id;

  const { messages, sendMessage, isSending } = useChatMessages(roomId);
  const { members } = useRoomMembers(roomId);
  const {
    isConnected,
    newMessages,
    typingUsers,
    sendMessage: sendSocketMessage,
    sendTypingStart,
    sendTypingStop,
  } = useChatSocket(roomId);

  const membersMap = useMemo(() => {
    const map = new Map<string, { name: string | null; email: string }>();
    for (const member of members) {
      map.set(member.userId, {
        name: member.user.name,
        email: member.user.email,
      });
    }
    return map;
  }, [members]);

  const allMessages = [...messages, ...newMessages];
  const scrollReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollReference.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const handleSend = (content: string) => {
    sendSocketMessage(content);
    sendMessage(content);
  };

  const getSenderInfo = (senderId: string) => {
    const member = membersMap.get(senderId);
    if (member) {
      return {
        senderName: member.name ?? "Unknown",
        senderEmail: member.email,
      };
    }
    return {
      senderName: "Unknown",
      senderEmail: "",
    };
  };

  return (
    <div className="flex h-full flex-1">
      <div className="flex-1 flex flex-col">
        {!isConnected && (
          <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm text-center py-1">
            Reconnecting...
          </div>
        )}

        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-2">
            {allMessages.map((msg) => {
              const senderInfo = getSenderInfo(msg.senderId);
              const createdAt = msg.createdAt
                ? new Date(msg.createdAt as string)
                : new Date();
              return (
                <MessageItem
                  key={msg.id}
                  id={msg.id}
                  senderId={msg.senderId}
                  senderName={senderInfo.senderName}
                  senderEmail={senderInfo.senderEmail}
                  content={msg.content}
                  createdAt={createdAt.toISOString()}
                  currentUserId={currentUserId}
                />
              );
            })}
            <div ref={scrollReference} />
          </div>
        </ScrollArea>

        <TypingIndicator users={typingUsers} />

        <ChatInput
          onSend={handleSend}
          onTypingStart={sendTypingStart}
          onTypingStop={sendTypingStop}
          disabled={!isConnected || isSending}
        />
      </div>

      <MembersSidebar roomId={roomId} />
    </div>
  );
}
