"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/design-system/components/ui/alert";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { CircleCheck, CircleAlert } from "lucide-react";
import { useState } from "react";
import { auth } from "@/shared/lib/auth";
import { AuthCard } from "./components/auth-card";

type ForgotPasswordState = {
  email: string;
};

type ForgotPasswordViewState = "idle" | "submitting" | "success" | "error";

export function ForgotPasswordView() {
  const [state, setState] = useState<ForgotPasswordState>({ email: "" });
  const [viewState, setViewState] = useState<ForgotPasswordViewState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ email: event.target.value });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!state.email) {
      return;
    }

    setViewState("submitting");
    const result = await auth.requestPasswordReset({
      email: state.email,
      redirectTo: "/auth/reset-password",
    });

    if (result.error) {
      setViewState("error");
      setErrorMessage(result.error.message ?? "Unable to send reset email");
      return;
    }

    setViewState("success");
  };

  return (
    <AuthCard
      description="Enter your email to receive a password reset link."
      title="Forgot password"
    >
      {viewState === "success" ? (
        <Alert>
          <CircleCheck />
          <AlertTitle>Check your email</AlertTitle>
          <AlertDescription>
            If an account exists with {state.email}, we sent a password reset
            link to your inbox.
          </AlertDescription>
        </Alert>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-neutral-800"
              htmlFor="forgot-email"
            >
              Email
            </label>
            <Input
              autoComplete="email"
              id="forgot-email"
              onChange={onChange}
              placeholder="you@example.com"
              required
              type="email"
              value={state.email}
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
            {viewState === "submitting" ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
