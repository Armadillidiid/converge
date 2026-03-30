"use client";

import { RoomListSidebar } from "./components/room-list-sidebar";
import { ChatView } from "./components/chat-view";
import { RoomListSidebarSkeleton } from "./components/room-list-sidebar";
import { ChatViewSkeleton } from "./components/chat-view";
import { ChatErrorBoundary } from "./components/chat-error-boundary";
import { Suspense } from "react";

type ChatIdViewProps = {
  roomId: string;
};

export function ChatIdView({ roomId }: ChatIdViewProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ChatErrorBoundary>
        <Suspense fallback={<RoomListSidebarSkeleton />}>
          <RoomListSidebar activeRoomId={roomId} onRoomSelect={() => {}} />
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
