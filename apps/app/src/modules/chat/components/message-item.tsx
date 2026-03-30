"use client";

import { formatDistanceToNow } from "date-fns";
import { Avatar } from "./avatar";
import { cn } from "@repo/design-system/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/design-system/components/ui/tooltip";

interface MessageItemProperties {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  content: string;
  createdAt: string;
  currentUserId?: string;
}

export function MessageItem({
  senderId,
  senderName,
  senderEmail,
  content,
  createdAt,
  currentUserId,
}: MessageItemProperties) {
  const isOwn = senderId === currentUserId;
  const createdAtDate = new Date(createdAt);

  return (
    <div
      className={cn(
        "flex gap-3 p-2 rounded-lg hover:bg-muted/50",
        isOwn && "flex-row-reverse",
      )}
    >
      <Avatar name={senderName} email={senderEmail} className="w-8 h-8" />

      <div className={cn("flex flex-col gap-1", isOwn && "items-end")}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{senderName}</span>
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="text-xs text-muted-foreground cursor-default">
                  {formatDistanceToNow(createdAtDate, { addSuffix: true })}
                </span>
              }
            />
            <TooltipContent>{createdAtDate.toLocaleString()}</TooltipContent>
          </Tooltip>
        </div>
        <p className="text-sm">{content}</p>
      </div>
    </div>
  );
}
