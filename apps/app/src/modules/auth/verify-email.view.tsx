"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/design-system/components/ui/alert";
import { buttonVariants } from "@repo/design-system/components/ui/button";
import { CircleAlert, CircleCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { auth } from "@/shared/lib/auth";
import { AuthCard } from "./components/auth-card";

type VerifyState = "idle" | "loading" | "success" | "error";

export function VerifyEmailView({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const router = useRouter();
  const params = use(searchParams);
  const token = params.token;
  const [state, setState] = useState<VerifyState>("idle");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }

    let cancelled = false;

    const verify = async () => {
      setState("loading");
      const result = await auth.verifyEmail({
        query: {
          token,
        },
      });

      if (cancelled) {
        return;
      }

      if (result.error) {
        setState("error");
        console.error(result.error.message ?? "Unable to verify email");
        return;
      }

      setState("success");
      setTimeout(() => {
        router.push("/");
      }, 1200);
    };

    void verify();

    return () => {
      cancelled = true;
    };
  }, [router, token]);

  return (
    <AuthCard
      description="We are confirming your account email address."
      title="Verify email"
      footer={
        <p className="text-center text-sm text-neutral-600">
          Back to{" "}
          <Link
            className="font-medium text-neutral-900 underline"
            href="/auth/sign-in"
          >
            sign in
          </Link>
        </p>
      }
    >
      {state === "loading" || state === "idle" ? (
        <Alert>
          <CircleCheck />
          <AlertTitle>Verifying...</AlertTitle>
          <AlertDescription>
            Please wait while we verify your email.
          </AlertDescription>
        </Alert>
      ) : null}

      {state === "success" ? (
        <Alert>
          <CircleCheck />
          <AlertTitle>Email verified</AlertTitle>
          <AlertDescription>Redirecting you to listings now.</AlertDescription>
        </Alert>
      ) : null}

      {state === "error" ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Verification failed</AlertTitle>
          <AlertDescription>
            The verification link is invalid or expired. Sign in and request
            another one.
          </AlertDescription>
        </Alert>
      ) : null}

      {state === "error" ? (
        <Link
          href="/auth/sign-in"
          className={buttonVariants({ variant: "outline" })}
        >
          Go to sign in
        </Link>
      ) : null}
    </AuthCard>
  );
}
