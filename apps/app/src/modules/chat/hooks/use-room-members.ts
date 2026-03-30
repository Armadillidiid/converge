import { useQuery } from "@tanstack/react-query";
import { chatGetMembersOptions } from "@repo/sdk/tanstack";

export function useRoomMembers(roomId: string) {
  const membersQuery = useQuery(
    chatGetMembersOptions({
      path: { id: roomId },
    }),
  );

  return {
    members: membersQuery.data?.items ?? [],
    isLoading: membersQuery.isLoading,
  };
}
