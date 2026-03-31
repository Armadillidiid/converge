"use client";

import { useEffect, useRef, useMemo } from "react";
import { useChatMessages } from "../hooks/use-chat-messages";
import { useChatSocket } from "../hooks/use-chat-socket";
import { useRoomMembers } from "../hooks/use-room-members";
import { MessageItem } from "./message-item";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";
import { MembersSidebar } from "./members-sidebar";
import { ChatHeader } from "./chat-header";
import { ScrollArea } from "@repo/design-system/components/ui/scroll-area";
import { auth } from "@/shared/lib/auth";
import { parseISO, compareAsc } from "date-fns";

interface ChatViewProperties {
  roomId: string;
}

export function ChatView({ roomId }: ChatViewProperties) {
  const { data: session } = auth.useSession();
  const currentUserId = session?.user?.id;

  const { messagesQuery } = useChatMessages(roomId);
  const { membersQuery } = useRoomMembers(roomId);
  const {
    isConnected,
    newMessages,
    typingUsers,
    sendMessage: sendSocketMessage,
    sendTypingStart,
    sendTypingStop,
  } = useChatSocket(roomId);

  const messages = messagesQuery.data?.items ?? [];

  const membersMap = useMemo(() => {
    const map = new Map<string, { name: string | null; email: string }>();
    for (const member of membersQuery.data?.items ?? []) {
      map.set(member.userId, {
        name: member.user.name,
        email: member.user.email,
      });
    }
    return map;
  }, [membersQuery.data?.items]);

  const allMessages = [...messages, ...newMessages];
  const scrollReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollReference.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const handleSend = (content: string) => {
    sendSocketMessage(content);
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

        <ChatHeader roomId={roomId} />

        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-2">
            {[...allMessages]
              .sort((a, b) => {
                const da = a.createdAt
                  ? parseISO(String(a.createdAt))
                  : new Date(0);
                const db = b.createdAt
                  ? parseISO(String(b.createdAt))
                  : new Date(0);
                return compareAsc(da, db);
              })
              .map((msg) => {
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
          disabled={!isConnected}
        />
      </div>

      <MembersSidebar roomId={roomId} />
    </div>
  );
}

export function ChatViewSkeleton() {
  return (
    <div className="flex h-full flex-1">
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 p-2">
                <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                <div className="flex flex-col gap-1 flex-1">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="h-10 bg-muted animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
}
