"use client";

interface TypingIndicatorProperties {
  users: Array<{ userId: string; userName: string }>;
}

export function TypingIndicator({ users }: TypingIndicatorProperties) {
  if (users.length === 0) return null;

  const text =
    users.length === 1
      ? `${users[0].userName} is typing...`
      : users.length === 2
        ? `${users[0].userName} and ${users[1].userName} are typing...`
        : `${users[0].userName} and ${users.length - 1} others are typing...`;

  return (
    <div className="px-4 py-2 text-sm text-muted-foreground animate-pulse">
      {text}
    </div>
  );
}
