import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
  chatGetInvitationsOptions,
  chatAcceptInvitationMutation,
  chatDeclineInvitationMutation,
} from "@repo/sdk/tanstack";

export function useInvitations() {
  const invitationsQuery = useSuspenseQuery(chatGetInvitationsOptions({}));

  const acceptMutation = useMutation(chatAcceptInvitationMutation());
  const declineMutation = useMutation(chatDeclineInvitationMutation());

  return {
    invitationsQuery,
    acceptMutation,
    declineMutation,
  };
}
