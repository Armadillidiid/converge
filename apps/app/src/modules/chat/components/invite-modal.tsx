"use client";

import { useState } from "react";
import { useInviteMember } from "../hooks/use-invite-member";
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

interface InviteModalProperties {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
}

export function InviteModal({
  open,
  onOpenChange,
  roomId,
}: InviteModalProperties) {
  const [email, setEmail] = useState("");
  const { inviteMember, isInviting } = useInviteMember();

  const handleSubmit = async () => {
    if (!email.trim()) return;
    try {
      await inviteMember({
        path: { id: roomId },
        body: { email: email.trim() },
      });
      setEmail("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to invite user:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to Room</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">User Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={isInviting}
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
          <Button onClick={handleSubmit} disabled={!email.trim() || isInviting}>
            {isInviting ? "Inviting..." : "Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
