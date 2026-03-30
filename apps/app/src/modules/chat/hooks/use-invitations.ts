import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  chatGetInvitationsOptions,
  chatAcceptInvitationMutation,
  chatDeclineInvitationMutation,
} from "@repo/sdk/tanstack";

export function useInvitations() {
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery(chatGetInvitationsOptions({}));

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
    isLoading: invitationsQuery.isLoading,
    acceptInvitation: (id: string) =>
      acceptMutation.mutateAsync({ path: { id } }),
    declineInvitation: (id: string) =>
      declineMutation.mutateAsync({ path: { id } }),
  };
}
