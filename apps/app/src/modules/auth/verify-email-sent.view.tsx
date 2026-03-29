"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/shared/lib/auth";
import { AuthCard } from "./components/auth-card";

type VerifyEmailSentViewProperties = {
  email?: string;
};

const RESEND_COOLDOWN = 60;

export function VerifyEmailSentView({ email }: VerifyEmailSentViewProperties) {
  const router = useRouter();
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setResendCooldown(resendCooldown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const { mutate: resendEmail, isPending: isResending } = useMutation({
    mutationFn: async () => {
      if (!email) {
        throw new Error("No email provided");
      }

      await auth.sendVerificationEmail({
        email,
      });
    },
    onSuccess: () => {
      setResendCooldown(RESEND_COOLDOWN);
    },
  });

  const { data, isPending, isError } = useQuery({
    queryKey: ["checkVerification"],
    queryFn: () => auth.getSession(),
    refetchInterval: 1000 * 60,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const handleResend = () => {
    if (resendCooldown > 0 || isResending) {
      return;
    }
    resendEmail();
  };

  useEffect(() => {
    if (isPending || isError) return;
    const sessionData = data as {
      user?: { emailVerified?: boolean; name?: string };
    } | null;
    const user = sessionData?.user;

    if (user?.emailVerified) {
      if (user.name) {
        router.push("/");
      } else {
        router.push("/auth/sign-in");
      }
    }
  }, [data, isPending, isError, router]);

  return (
    <AuthCard
      description="We sent a verification link to your inbox."
      title="Check your email"
      footer={
        <p className="text-center text-sm text-neutral-600">
          Already verified?{" "}
          <Link
            className="font-medium text-neutral-900 underline"
            href="/auth/sign-in"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        {email ? (
          <p>
            Verification message sent to{" "}
            <span className="font-medium">{email}</span>.
          </p>
        ) : (
          <p>
            Verification message sent. Open your inbox and click the link to
            continue.
          </p>
        )}
      </div>
      <p className="text-sm text-neutral-600">
        Didn&apos;t receive an email? Check your spam folder, or click below to
        resend.
      </p>
      <Button
        className="w-full"
        onClick={handleResend}
        disabled={resendCooldown > 0 || isResending}
        variant="outline"
      >
        {isResending
          ? "Sending..."
          : resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : "Resend verification email"}
      </Button>
    </AuthCard>
  );
}
