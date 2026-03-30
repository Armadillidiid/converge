import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
  chatGetMessagesOptions,
  chatCreateMessageMutation,
} from "@repo/sdk/tanstack";

export function useChatMessages(roomId: string) {
  const messagesQuery = useSuspenseQuery(
    chatGetMessagesOptions({
      path: { id: roomId },
      query: { limit: 100 },
    }),
  );

  const sendMessageMutation = useMutation(chatCreateMessageMutation());

  return {
    messagesQuery,
    sendMessageMutation,
  };
}
