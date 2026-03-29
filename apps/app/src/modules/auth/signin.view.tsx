"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { auth } from "@/shared/lib/auth";
import { AuthCard } from "./components/auth-card";
import { GoogleOAuthButton } from "./components/google-oauth-button";

type SignInState = {
  email: string;
  password: string;
};

type SignInViewProperties = {
  readonly isModal?: boolean;
};

export function SignInView({ isModal = false }: SignInViewProperties) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => searchParams.get("next") ?? "/",
    [searchParams],
  );
  const [state, setState] = useState<SignInState>({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (key: keyof SignInState, value: string) => {
    setState((previousState) => ({
      ...previousState,
      [key]: value,
    }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!state.email || !state.password) {
      return;
    }

    setIsSubmitting(true);
    const result = await auth.signIn.email({
      email: state.email,
      password: state.password,
    });
    setIsSubmitting(false);

    if (result.error) {
      // TODO: Replace with enum from Better Auth
      if (result.error.code === "EMAIL_NOT_VERIFIED") {
        const query = new URLSearchParams({ email: state.email });
        if (isModal) {
          window.location.href = `/auth/verify-email-sent?${query.toString()}`;
        } else {
          router.push(`/auth/verify-email-sent?${query.toString()}`);
        }
        return;
      }

      console.error(result.error.message ?? "Unable to sign in. Try again.");
      return;
    }

    if (isModal) {
      router.back();
    } else {
      router.push(nextPath);
    }
  };

  return (
    <AuthCard
      description="Sign in to save listings and contact agents quickly."
      footer={
        <p className="text-center text-sm text-neutral-600">
          New here?{" "}
          {/* oxlint-disable-next-line nextjs/no-html-link-for-pages "Because of the parallel route rendering a modal, we have to hard reload the page to show the sign up form" */}
          <a
            className="font-medium text-neutral-900 underline"
            href="/auth/sign-up"
            onClick={(event) => {
              if (isModal) {
                event.preventDefault();
                router.replace(`/auth/sign-up`);
              }
            }}
          >
            Create an account
          </a>
        </p>
      }
      title="Sign in"
      variant={isModal ? "modal" : "card"}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-800"
            htmlFor="signin-email"
          >
            Email
          </label>
          <Input
            autoComplete="email"
            id="signin-email"
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={state.email}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-800"
            htmlFor="signin-password"
          >
            Password
          </label>
          <div className="relative">
            <Input
              autoComplete="current-password"
              className="pr-10"
              id="signin-password"
              minLength={8}
              onChange={(event) => onChange("password", event.target.value)}
              placeholder="Enter your password"
              required
              type={showPassword ? "text" : "password"}
              value={state.password}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative text-center text-xs uppercase">
          <span className="bg-white px-2 text-neutral-500">
            or continue with Google
          </span>
        </div>
      </div>
      <GoogleOAuthButton callbackURL={nextPath} />
    </AuthCard>
  );
}
