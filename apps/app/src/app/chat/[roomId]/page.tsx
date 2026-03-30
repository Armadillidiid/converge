"use client";

import { useParams } from "next/navigation";
import { ChatView, RoomListSidebar } from "@modules/chat";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <RoomListSidebar activeRoomId={roomId} onRoomSelect={() => {}} />
      <div className="flex-1">
        <ChatView roomId={roomId} />
      </div>
    </div>
  );
}
