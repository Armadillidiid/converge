"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChatRooms } from "../hooks/use-chat-rooms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/design-system/components/ui/dialog";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";

interface CreateRoomModalProperties {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoomModal({
  open,
  onOpenChange,
}: CreateRoomModalProperties) {
  const [name, setName] = useState("");
  const { createRoomMutation } = useChatRooms();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      const room = await createRoomMutation.mutateAsync({
        body: { name: name.trim() },
      });
      onOpenChange(false);
      router.push(`/chat/${room.id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter room name"
              disabled={createRoomMutation.isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || createRoomMutation.isPending}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
