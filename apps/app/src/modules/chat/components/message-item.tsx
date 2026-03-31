"use client";

import { formatDistanceToNow } from "date-fns";
import { Avatar } from "./avatar";
import { cn } from "@repo/design-system/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/design-system/components/ui/tooltip";
import { Button } from "@repo/design-system/components/ui/button";
import {
  SparklesIcon,
  Volume2Icon,
  VolumeXIcon,
  Loader2Icon,
} from "lucide-react";
import { useTTS } from "../hooks/use-tts";

const COPILOT_USER_ID = "copilot";

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
  const isCopilot = senderId === COPILOT_USER_ID;
  const createdAtDate = new Date(createdAt);

  const { isSpeaking, isLoading, speak, stop } = useTTS();

  const handlePlayClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(content);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 p-2 rounded-lg hover:bg-muted/50 group",
        isOwn && "flex-row-reverse",
        isCopilot && "bg-primary/5 border-l-2 border-primary",
      )}
    >
      {isCopilot ? (
        <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-primary/10">
          <SparklesIcon className="size-4 text-primary" />
        </div>
      ) : (
        <Avatar name={senderName} email={senderEmail} className="w-8 h-8" />
      )}

      <div className={cn("flex flex-col gap-1 flex-1", isOwn && "items-end")}>
        <div className="flex items-center gap-2">
          <span
            className={cn("text-sm font-medium", isCopilot && "text-primary")}
          >
            {senderName}
          </span>
          {isCopilot && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
              AI
            </span>
          )}
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
        <div className="flex items-end gap-2">
          <p className="text-sm whitespace-pre-wrap flex-1">{content}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
            onClick={handlePlayClick}
            disabled={isLoading}
            title={isSpeaking ? "Stop" : "Read aloud"}
          >
            {isLoading ? (
              <Loader2Icon className="w-3 h-3 animate-spin" />
            ) : isSpeaking ? (
              <VolumeXIcon className="w-3 h-3" />
            ) : (
              <Volume2Icon className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
