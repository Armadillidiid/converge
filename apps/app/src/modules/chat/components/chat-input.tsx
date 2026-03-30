"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@repo/design-system/components/ui/button";
import { Textarea } from "@repo/design-system/components/ui/textarea";

interface ChatInputProperties {
  onSend: (content: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled,
}: ChatInputProperties) {
  const [content, setContent] = useState("");
  const typingTimeoutReference = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const handleTyping = useCallback(() => {
    onTypingStart();
    if (typingTimeoutReference.current) {
      clearTimeout(typingTimeoutReference.current);
    }
    typingTimeoutReference.current = setTimeout(() => {
      onTypingStop();
    }, 2000);
  }, [onTypingStart, onTypingStop]);

  const handleSubmit = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setContent("");
    onTypingStop();
  }, [content, onSend, onTypingStop]);

  return (
    <div className="flex gap-2 p-4 border-t bg-background">
      <Textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          handleTyping();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Type a message..."
        disabled={disabled}
        className="min-h-[40px] max-h-[120px] resize-none"
      />
      <Button onClick={handleSubmit} disabled={disabled || !content.trim()}>
        Send
      </Button>
    </div>
  );
}
