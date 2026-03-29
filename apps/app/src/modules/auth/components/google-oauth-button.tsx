"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Chrome } from "lucide-react";
import { auth } from "@/shared/lib/auth";

type GoogleOAuthButtonProperties = {
  callbackURL: string;
};

export function GoogleOAuthButton({
  callbackURL,
}: GoogleOAuthButtonProperties) {
  const handleGoogleSignIn = async () => {
    const result = await auth.signIn.social({
      provider: "google",
      callbackURL,
    });

    if (result.error) {
      console.error(result.error.message ?? "Unable to sign in with Google");
    }
  };

  return (
    <Button
      className="w-full"
      onClick={() => void handleGoogleSignIn()}
      type="button"
      variant="outline"
    >
      <Chrome className="size-4" />
      Continue with Google
    </Button>
  );
}
