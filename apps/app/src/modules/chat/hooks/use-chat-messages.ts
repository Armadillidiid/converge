import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  chatGetMessagesOptions,
  chatCreateMessageMutation,
} from "@repo/sdk/tanstack";

export function useChatMessages(roomId: string) {
  const queryClient = useQueryClient();

  const messagesQuery = useSuspenseQuery(
    chatGetMessagesOptions({
      path: { id: roomId },
      query: { limit: 100 },
    }),
  );

  const sendMessageMutation = useMutation({
    ...chatCreateMessageMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", roomId],
      });
    },
  });

  return {
    messages: messagesQuery.data?.items ?? [],
    sendMessage: (content: string) =>
      sendMessageMutation.mutateAsync({
        path: { id: roomId },
        body: { content },
      }),
    isSending: sendMessageMutation.isPending,
  };
}
