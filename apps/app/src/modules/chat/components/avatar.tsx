"use client";

import { cn } from "@repo/design-system/lib/utils";

interface AvatarProperties {
  name: string;
  email: string;
  className?: string;
}

function generateGradient(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${(hue + 30) % 360}, 70%, 60%))`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ name, email, className }: AvatarProperties) {
  const initials = getInitials(name);
  const gradient = generateGradient(email);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full text-white font-semibold text-sm shrink-0",
        className,
      )}
      style={{ background: gradient }}
    >
      {initials}
    </div>
  );
}
