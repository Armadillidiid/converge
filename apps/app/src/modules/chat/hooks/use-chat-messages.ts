import { useSuspenseQuery } from "@tanstack/react-query";
import { chatGetMessagesOptions } from "@repo/sdk/tanstack";

export function useChatMessages(roomId: string) {
  const messagesQuery = useSuspenseQuery(
    chatGetMessagesOptions({
      path: { id: roomId },
      query: { limit: 100 },
    }),
  );

  return {
    messagesQuery,
  };
}
