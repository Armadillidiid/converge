import { useSuspenseQuery } from "@tanstack/react-query";
import { chatGetMembersOptions } from "@repo/sdk/tanstack";

export function useRoomMembers(roomId: string) {
  const membersQuery = useSuspenseQuery(
    chatGetMembersOptions({
      path: { id: roomId },
    }),
  );

  return {
    members: membersQuery.data?.items ?? [],
  };
}
