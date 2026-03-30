"use client";

import { useRoomMembers } from "../hooks/use-room-members";
import { useChatSocket } from "../hooks/use-chat-socket";
import { Avatar } from "./avatar";
import { ScrollArea } from "@repo/design-system/components/ui/scroll-area";
import { cn } from "@repo/design-system/lib/utils";

interface MembersSidebarProperties {
  roomId: string;
}

export function MembersSidebar({ roomId }: MembersSidebarProperties) {
  const { members } = useRoomMembers(roomId);
  const { onlineUsers } = useChatSocket(roomId);

  const onlineSet = new Set(onlineUsers);

  const sortedMembers = [...members].sort((a, b) => {
    const aOnline = onlineSet.has(a.userId);
    const bOnline = onlineSet.has(b.userId);
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return (a.user.name ?? "").localeCompare(b.user.name ?? "");
  });

  return (
    <div className="w-64 border-l flex flex-col h-full">
      <div className="p-4 border-b font-semibold">Members</div>
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {sortedMembers.map((member) => {
            const isOnline = onlineSet.has(member.userId);
            return (
              <div
                key={member.id}
                className={cn(
                  "flex items-center gap-3 p-3",
                  !isOnline && "opacity-50",
                )}
              >
                <Avatar
                  name={member.user.name ?? "Unknown"}
                  email={member.user.email}
                  className="w-8 h-8"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">
                    {member.user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {member.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
