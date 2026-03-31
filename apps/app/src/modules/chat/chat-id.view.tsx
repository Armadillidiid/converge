"use client";

import { RoomListSidebar } from "./components/room-list-sidebar";
import { ChatView } from "./components/chat-view";
import { RoomListSidebarSkeleton } from "./components/room-list-sidebar";
import { ChatViewSkeleton } from "./components/chat-view";
import { ChatErrorBoundary } from "./components/chat-error-boundary";
import { Suspense } from "react";
import { useRouter } from "next/navigation";

type ChatIdViewProps = {
  roomId: string;
};

export function ChatIdView({ roomId }: ChatIdViewProps) {
  const router = useRouter();

  const handleRoomSelect = (roomId: string) => {
    router.push(`/chat/${roomId}`);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ChatErrorBoundary>
        <Suspense fallback={<RoomListSidebarSkeleton />}>
          <RoomListSidebar
            activeRoomId={roomId}
            onRoomSelect={handleRoomSelect}
          />
        </Suspense>
      </ChatErrorBoundary>
      <ChatErrorBoundary>
        <Suspense fallback={<ChatViewSkeleton />}>
          <ChatView roomId={roomId} />
        </Suspense>
      </ChatErrorBoundary>
    </div>
  );
}
