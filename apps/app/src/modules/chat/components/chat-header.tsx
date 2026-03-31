"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { chatGetRoomOptions } from "@repo/sdk/tanstack";
import { auth } from "@/shared/lib/auth";
import { useChatRooms } from "../hooks/use-chat-rooms";
import { InviteModal } from "./invite-modal";

interface ChatHeaderProperties {
  roomId: string;
}

export function ChatHeader({ roomId }: ChatHeaderProperties) {
  const router = useRouter();
  const { data: session } = auth.useSession();
  const { deleteRoomMutation, leaveRoomMutation } = useChatRooms();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { data: room } = useQuery(chatGetRoomOptions({ path: { id: roomId } }));

  const currentUserId = session?.user?.id;
  const isOwner = room?.ownerId === currentUserId;

  const handleLeave = async () => {
    try {
      await leaveRoomMutation.mutateAsync({ path: { id: roomId } });
      router.push("/chat");
    } catch (error) {
      console.error("Failed to leave room:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRoomMutation.mutateAsync({ path: { id: roomId } });
      router.push("/chat");
    } catch (error) {
      console.error("Failed to delete room:", error);
    }
  };

  if (!room) {
    return (
      <div className="p-4 border-b">
        <div className="h-8 w-32 animate-pulse bg-muted rounded-md" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold truncate">{room.name}</h2>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowInviteModal(true)}>
            Invite
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLeave}>
                Leave room
              </DropdownMenuItem>
              {isOwner && (
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  Delete room
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <InviteModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        roomId={roomId}
      />
    </>
  );
}
