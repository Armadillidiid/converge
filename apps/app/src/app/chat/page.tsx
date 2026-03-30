"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoomListSidebar } from "@modules/chat";
import { Card } from "@repo/design-system/components/ui/card";

export default function ChatPage() {
  const router = useRouter();
  const [activeRoomId, setActiveRoomId] = useState<string | undefined>();

  const handleRoomSelect = (roomId: string) => {
    setActiveRoomId(roomId);
    router.push(`/chat/${roomId}`);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <RoomListSidebar
        activeRoomId={activeRoomId}
        onRoomSelect={handleRoomSelect}
      />

      <div className="flex-1 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Select a room</h2>
          <p className="text-muted-foreground">
            Choose a room from the list to start chatting
          </p>
        </Card>
      </div>
    </div>
  );
}
