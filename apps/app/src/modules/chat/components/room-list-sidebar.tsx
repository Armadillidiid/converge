"use client";

import { useState } from "react";
import { useChatRooms } from "../hooks/use-chat-rooms";
import { Button } from "@repo/design-system/components/ui/button";
import { Badge } from "@repo/design-system/components/ui/badge";
import { ScrollArea } from "@repo/design-system/components/ui/scroll-area";
import { cn } from "@repo/design-system/lib/utils";
import { CreateRoomModal } from "./create-room-modal";
import { InvitationsModal } from "./invitations-modal";
import { useInvitations } from "../hooks/use-invitations";

interface RoomListSidebarProperties {
  activeRoomId?: string;
  onRoomSelect: (roomId: string) => void;
}

export function RoomListSidebar({
  activeRoomId,
  onRoomSelect,
}: RoomListSidebarProperties) {
  const { rooms, isLoading } = useChatRooms();
  const { invitations } = useInvitations();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInvitationsModal, setShowInvitationsModal] = useState(false);

  return (
    <div className="w-80 border-r flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Chat</h2>
        <div className="flex gap-2">
          {invitations.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInvitationsModal(true)}
            >
              Invitations
              <Badge variant="destructive" className="ml-1">
                {invitations.length}
              </Badge>
            </Button>
          )}
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            New Room
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading...
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No rooms yet. Create one to get started!
          </div>
        ) : (
          <div className="divide-y">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onRoomSelect(room.id)}
                className={cn(
                  "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                  activeRoomId === room.id && "bg-muted",
                )}
              >
                <div className="font-medium">{room.name}</div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      <CreateRoomModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      <InvitationsModal
        open={showInvitationsModal}
        onOpenChange={setShowInvitationsModal}
      />
    </div>
  );
}
