import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
  chatGetRoomsOptions,
  chatCreateRoomMutation,
  chatDeleteRoomMutation,
  chatLeaveRoomMutation,
} from "@repo/sdk/tanstack";

export function useChatRooms() {
  const roomsQuery = useSuspenseQuery(chatGetRoomsOptions({}));

  const createRoomMutation = useMutation(chatCreateRoomMutation());
  const deleteRoomMutation = useMutation(chatDeleteRoomMutation());
  const leaveRoomMutation = useMutation(chatLeaveRoomMutation());

  return {
    roomsQuery,
    createRoomMutation,
    deleteRoomMutation,
    leaveRoomMutation,
  };
}
