import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  chatGetRoomsOptions,
  chatCreateRoomMutation,
  chatDeleteRoomMutation,
  chatLeaveRoomMutation,
} from "@repo/sdk/tanstack";

export function useChatRooms() {
  const queryClient = useQueryClient();

  const roomsQuery = useQuery(chatGetRoomsOptions({}));

  const createRoomMutation = useMutation({
    ...chatCreateRoomMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
    },
  });

  const deleteRoomMutation = useMutation({
    ...chatDeleteRoomMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
    },
  });

  const leaveRoomMutation = useMutation({
    ...chatLeaveRoomMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
    },
  });

  return {
    rooms: roomsQuery.data?.items ?? [],
    isLoading: roomsQuery.isLoading,
    createRoom: (name: string) =>
      createRoomMutation.mutateAsync({ body: { name } }),
    isCreating: createRoomMutation.isPending,
    deleteRoom: (id: string) =>
      deleteRoomMutation.mutateAsync({ path: { id } }),
    isDeleting: deleteRoomMutation.isPending,
    leaveRoom: (id: string) => leaveRoomMutation.mutateAsync({ path: { id } }),
  };
}
