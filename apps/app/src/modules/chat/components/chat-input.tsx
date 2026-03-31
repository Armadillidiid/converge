"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@repo/design-system/components/ui/button";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { MicIcon, Loader2Icon } from "lucide-react";
import {
  MentionMenu,
  mentionCommands,
  type MentionCommand,
} from "./mention-menu";
import { useVoiceInput } from "../hooks/use-voice-input";

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
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutReference = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const {
    isRecording,
    isTranscribing,
    transcript,
    error: voiceError,
    startRecording,
    stopRecording,
    resetTranscript,
  } = useVoiceInput();

  // Apply transcript to content when ready
  useEffect(() => {
    if (transcript) {
      setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Show error if voice input fails
  useEffect(() => {
    if (voiceError) {
      console.error("Voice input error:", voiceError);
    }
  }, [voiceError]);

  const filteredCommands = mentionCommands.filter((cmd) =>
    cmd.name.startsWith(mentionQuery.toLowerCase()),
  );

  const updateCursorPosition = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const rect = textarea.getBoundingClientRect();
    const text = textarea.value.substring(0, textarea.selectionStart);
    const lines = text.split("\n");
    const currentLine = lines.length - 1;

    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
    const paddingTop = parseInt(getComputedStyle(textarea).paddingTop) || 0;

    const top =
      rect.top +
      paddingTop +
      currentLine * lineHeight -
      textarea.scrollTop +
      lineHeight;

    const charWidth = parseInt(getComputedStyle(textarea).fontSize) * 0.6;
    const lastLineLength = lines[currentLine]?.length || 0;
    const left = rect.left + lastLineLength * charWidth * 0.5;

    setCursorPosition({ top, left });
  }, []);

  const handleTyping = useCallback(() => {
    onTypingStart();
    if (typingTimeoutReference.current) {
      clearTimeout(typingTimeoutReference.current);
    }
    typingTimeoutReference.current = setTimeout(() => {
      onTypingStop();
    }, 2000);
  }, [onTypingStart, onTypingStop]);

  const handleContentChange = useCallback(
    (value: string, cursorPos: number) => {
      setContent(value);

      const lastAtIndex = value.lastIndexOf("@", cursorPos - 1);
      const hasMentionTrigger = lastAtIndex !== -1;

      if (hasMentionTrigger) {
        const textAfterAt = value.substring(lastAtIndex + 1, cursorPos);
        const hasSpaceAfterAt = textAfterAt.includes(" ");

        if (!hasSpaceAfterAt) {
          const query = textAfterAt;
          setMentionStartIndex(lastAtIndex);
          setMentionQuery(query);
          setShowMentions(true);
          setSelectedIndex(0);
          updateCursorPosition();
          return;
        }
      }

      setShowMentions(false);
      setMentionQuery("");
    },
    [updateCursorPosition],
  );

  const handleMentionSelect = useCallback(
    (command: MentionCommand) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const beforeMention = content.substring(0, mentionStartIndex);
      const afterCursor = content.substring(textarea.selectionStart);
      const newContent = `${beforeMention}${command.display} ${afterCursor}`;

      setContent(newContent);
      setShowMentions(false);
      setMentionQuery("");

      const newCursorPos = beforeMention.length + command.display.length + 1;
      setTimeout(() => {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    },
    [content, mentionStartIndex],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (showMentions && filteredCommands.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          return;
        }
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          handleMentionSelect(filteredCommands[selectedIndex]);
          return;
        }
        if (e.key === "Escape") {
          setShowMentions(false);
          return;
        }
      }

      if (e.key === "Enter" && !e.shiftKey && !showMentions) {
        e.preventDefault();
        const trimmed = content.trim();
        if (!trimmed) return;
        onSend(trimmed);
        setContent("");
        onTypingStop();
      }
    },
    [
      showMentions,
      filteredCommands,
      selectedIndex,
      content,
      onSend,
      onTypingStop,
      handleMentionSelect,
    ],
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleSelectionChange = () => {
      const pos = textarea.selectionStart;
      handleContentChange(content, pos);
    };

    textarea.addEventListener("click", handleSelectionChange);
    return () => textarea.removeEventListener("click", handleSelectionChange);
  }, [content, handleContentChange]);

  const handleSubmit = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setContent("");
    onTypingStop();
  }, [content, onSend, onTypingStop]);

  const handleMicClick = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const isEmpty = !content.trim();
  const showMicButton = isEmpty && !isTranscribing;

  return (
    <div className="relative flex gap-2 p-4 border-t bg-background">
      {showMentions && filteredCommands.length > 0 && (
        <MentionMenu
          query={mentionQuery}
          position={cursorPosition}
          onSelect={handleMentionSelect}
          onClose={() => setShowMentions(false)}
          selectedIndex={selectedIndex}
        />
      )}
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          handleContentChange(e.target.value, e.target.selectionStart);
          handleTyping();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... Use @copilot to invoke AI"
        disabled={disabled || isRecording || isTranscribing}
        className="min-h-[40px] max-h-[120px] resize-none"
      />
      {showMicButton ? (
        <Button
          variant="outline"
          size="icon"
          onClick={handleMicClick}
          disabled={disabled}
          title="Record voice message"
        >
          {isRecording ? (
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          ) : (
            <MicIcon className="w-4 h-4" />
          )}
        </Button>
      ) : (
        <Button onClick={handleSubmit} disabled={disabled || !content.trim()}>
          {isTranscribing ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : (
            "Send"
          )}
        </Button>
      )}
    </div>
  );
}
