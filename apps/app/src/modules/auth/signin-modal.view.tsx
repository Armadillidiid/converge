"use client";

import {
  Dialog,
  DialogContent,
} from "@repo/design-system/components/ui/dialog";
import { useRouter } from "next/navigation";
import { SignInView } from "./signin.view";

type SignInModalViewProperties = {
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
};

export function SignInModalView({
  open,
  onOpenChange,
}: SignInModalViewProperties) {
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
        <SignInView isModal={true} />
      </DialogContent>
    </Dialog>
  );
}
