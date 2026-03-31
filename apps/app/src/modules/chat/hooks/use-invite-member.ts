import { useMutation } from "@tanstack/react-query";
import { chatInviteMemberMutation } from "@repo/sdk/tanstack";

export function useInviteMember() {
  const mutation = useMutation(chatInviteMemberMutation());

  return {
    inviteMember: mutation.mutateAsync,
    isInviting: mutation.isPending,
  };
}
