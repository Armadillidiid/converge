"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/design-system/components/ui/alert";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { CircleCheck, CircleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/shared/lib/auth";
import { AuthCard } from "./components/auth-card";

type ResetPasswordState = {
  password: string;
  confirmPassword: string;
};

type ResetPasswordViewState =
  | "idle"
  | "submitting"
  | "success"
  | "error"
  | "invalid";

export function ResetPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<ResetPasswordState>({
    password: "",
    confirmPassword: "",
  });
  const [viewState, setViewState] = useState<ResetPasswordViewState>(
    token ? "idle" : "invalid",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setViewState("invalid");
    }
  }, [token]);

  useEffect(() => {
    if (viewState === "success") {
      const timeoutId = setTimeout(() => {
        router.push("/");
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [router, viewState]);

  const onChange = (key: keyof ResetPasswordState, value: string) => {
    setState((previous) => ({ ...previous, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!state.password || !state.confirmPassword) {
      return;
    }

    if (state.password !== state.confirmPassword) {
      setErrorMessage("Passwords do not match");
      setViewState("error");
      return;
    }

    if (state.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      setViewState("error");
      return;
    }

    setViewState("submitting");
    const result = await auth.resetPassword({
      newPassword: state.password,
      token: token ?? undefined,
    });

    if (result.error) {
      setViewState("error");
      setErrorMessage(result.error.message ?? "Unable to reset password");
      return;
    }

    setViewState("success");
  };

  return (
    <AuthCard
      description="Enter your new password below."
      title="Reset password"
      footer={
        <p className="text-center text-sm text-neutral-600">
          Remember your password?{" "}
          <Link
            className="font-medium text-neutral-900 underline"
            href="/auth/sign-in"
          >
            Sign in
          </Link>
        </p>
      }
    >
      {viewState === "invalid" ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Invalid reset link</AlertTitle>
          <AlertDescription>
            This password reset link is invalid or has expired. Please request a
            new one.
          </AlertDescription>
        </Alert>
      ) : viewState === "success" ? (
        <Alert>
          <CircleCheck />
          <AlertTitle>Password reset successful</AlertTitle>
          <AlertDescription>Redirecting you to home page...</AlertDescription>
        </Alert>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-neutral-800"
              htmlFor="reset-password"
            >
              New password
            </label>
            <Input
              autoComplete="new-password"
              id="reset-password"
              minLength={8}
              onChange={(e) => onChange("password", e.target.value)}
              placeholder="Create a strong password"
              required
              type="password"
              value={state.password}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-neutral-800"
              htmlFor="reset-confirm-password"
            >
              Confirm password
            </label>
            <Input
              autoComplete="new-password"
              id="reset-confirm-password"
              minLength={8}
              onChange={(e) => onChange("confirmPassword", e.target.value)}
              placeholder="Confirm your password"
              required
              type="password"
              value={state.confirmPassword}
            />
          </div>

          {viewState === "error" && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            disabled={viewState === "submitting"}
            type="submit"
          >
            {viewState === "submitting" ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
