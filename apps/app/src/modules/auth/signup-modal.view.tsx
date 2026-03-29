"use client";

import {
  Dialog,
  DialogContent,
} from "@repo/design-system/components/ui/dialog";
import { useRouter } from "next/navigation";
import { SignUpView } from "./signup.view";

type SignUpModalViewProperties = {
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
};

export function SignUpModalView({
  open,
  onOpenChange,
}: SignUpModalViewProperties) {
  const router = useRouter();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      router.back();
    }
    onOpenChange?.(isOpen);
  };

  return (
    <Dialog defaultOpen onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="sm:max-w-md p-0">
        <SignUpView isModal={true} />
      </DialogContent>
    </Dialog>
  );
}
