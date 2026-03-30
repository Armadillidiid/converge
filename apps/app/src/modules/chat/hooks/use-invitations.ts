import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  chatGetInvitationsOptions,
  chatAcceptInvitationMutation,
  chatDeclineInvitationMutation,
} from "@repo/sdk/tanstack";

export function useInvitations() {
  const queryClient = useQueryClient();

  const invitationsQuery = useSuspenseQuery(chatGetInvitationsOptions({}));

  const acceptMutation = useMutation({
    ...chatAcceptInvitationMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "invitations"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
    },
  });

  const declineMutation = useMutation({
    ...chatDeclineInvitationMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "invitations"] });
    },
  });

  return {
    invitations: invitationsQuery.data?.items ?? [],
    acceptInvitation: (id: string) =>
      acceptMutation.mutateAsync({ path: { id } }),
    declineInvitation: (id: string) =>
      declineMutation.mutateAsync({ path: { id } }),
  };
}
