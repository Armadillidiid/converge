"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChatRooms } from "../hooks/use-chat-rooms";
import { Button } from "@repo/design-system/components/ui/button";
import { Badge } from "@repo/design-system/components/ui/badge";
import { ScrollArea } from "@repo/design-system/components/ui/scroll-area";
import { cn } from "@repo/design-system/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { Avatar } from "./avatar";
import { auth } from "@/shared/lib/auth";
import { clearAuthTokenCookie } from "@/shared/lib/auth-token-cookie";
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
  const router = useRouter();
  const { data: session } = auth.useSession();
  const { roomsQuery } = useChatRooms();
  const { invitationsQuery } = useInvitations();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInvitationsModal, setShowInvitationsModal] = useState(false);

  const rooms = roomsQuery.data?.items ?? [];
  const invitations = invitationsQuery.data?.items ?? [];

  const handleSignOut = async () => {
    await auth.signOut();
    clearAuthTokenCookie();
    router.push("/");
  };

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
        {rooms.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No rooms yet. Create one to get started!
          </div>
        ) : (
          <div className="divide-y">
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
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

      {session?.user && (
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-auto py-2"
                >
                  <Avatar
                    name={session.user.name ?? ""}
                    email={session.user.email ?? ""}
                    className="w-8 h-8"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium">
                      {session.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {session.user.email}
                    </span>
                  </div>
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => void handleSignOut()}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

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

export function RoomListSidebarSkeleton() {
  return (
    <div className="w-80 border-r flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Chat</h2>
        <Button size="sm" disabled>
          New Room
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <button
              key={i}
              type="button"
              className="h-16 bg-muted animate-pulse rounded-md w-full"
              disabled
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
