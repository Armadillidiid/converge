"use client";

import { useInvitations } from "../hooks/use-invitations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/design-system/components/ui/dialog";
import { Button } from "@repo/design-system/components/ui/button";
import { ScrollArea } from "@repo/design-system/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface InvitationsModalProperties {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvitationsModal({
  open,
  onOpenChange,
}: InvitationsModalProperties) {
  const { invitations, acceptInvitation, declineInvitation } = useInvitations();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invitations</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          {invitations.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No pending invitations
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv) => {
                const createdAtDate = inv.createdAt
                  ? new Date(inv.createdAt as string)
                  : new Date();
                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="min-w-0">
                      <div className="font-medium">Room invitation</div>
                      <div className="text-sm text-muted-foreground">
                        Room ID: {inv.roomId} •{" "}
                        {formatDistanceToNow(createdAtDate, {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => declineInvitation(inv.id)}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => acceptInvitation(inv.id)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
