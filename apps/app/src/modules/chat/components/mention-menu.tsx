"use client";

import { cn } from "@repo/design-system/lib/utils";
import { SparklesIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

export type MentionCommand = {
  name: string;
  display: string;
  description: string;
  icon: ReactNode;
};

export const mentionCommands: MentionCommand[] = [
  {
    name: "copilot",
    display: "@copilot",
    description: "Invoke AI Copilot",
    icon: <SparklesIcon className="size-3.5" />,
  },
];

type MentionMenuProperties = {
  query: string;
  position: { top: number; left: number };
  onSelect: (command: MentionCommand) => void;
  onClose: () => void;
  selectedIndex: number;
};

export function MentionMenu({
  query,
  position,
  onSelect,
  onClose: _onClose,
  selectedIndex,
}: MentionMenuProperties) {
  const menuRef = useRef<HTMLDivElement>(null);
  const filtered = mentionCommands.filter((cmd) =>
    cmd.name.startsWith(query.toLowerCase()),
  );

  useEffect(() => {
    const selected = menuRef.current?.querySelector("[data-selected='true']");
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (filtered.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed z-50 overflow-hidden rounded-xl border border-border/50 bg-card/95 shadow-[var(--shadow-float)] backdrop-blur-xl"
      ref={menuRef}
      style={{
        top: position.top,
        left: position.left,
        transform: "translateY(-100%)",
      }}
    >
      <div className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
        Mentions
      </div>
      <div className="max-h-64 overflow-y-auto pb-1 no-scrollbar">
        {filtered.map((cmd, index) => (
          <button
            className={cn(
              "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
              index === selectedIndex ? "bg-muted/70" : "hover:bg-muted/40",
            )}
            data-selected={index === selectedIndex}
            key={cmd.name}
            onClick={() => onSelect(cmd)}
            onMouseDown={(e) => e.preventDefault()}
            type="button"
          >
            <div className="flex size-6 shrink-0 items-center justify-center text-muted-foreground/60">
              {cmd.icon}
            </div>
            <span className="font-mono text-[13px] text-foreground">
              {cmd.display}
            </span>
            <span className="text-[12px] text-muted-foreground/50">
              {cmd.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
