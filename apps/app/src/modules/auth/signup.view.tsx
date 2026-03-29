"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/shared/lib/auth";
import { AuthCard } from "./components/auth-card";
import { GoogleOAuthButton } from "./components/google-oauth-button";

type SignUpState = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

type SignUpViewProperties = {
  readonly isModal?: boolean;
};

export function SignUpView({ isModal = false }: SignUpViewProperties) {
  const router = useRouter();
  const [state, setState] = useState<SignUpState>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (key: keyof SignUpState, value: string) => {
    setState((previousState) => ({
      ...previousState,
      [key]: value,
    }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !state.email ||
      !state.firstName ||
      !state.lastName ||
      !state.password
    ) {
      return;
    }

    setIsSubmitting(true);
    const result = await auth.signUp.email({
      name: `${state.firstName} ${state.lastName}`,
      email: state.email,
      password: state.password,
    });
    setIsSubmitting(false);

    if (result.error) {
      console.error(result.error.message ?? "Unable to create account");
      return;
    }

    const query = new URLSearchParams({ email: state.email });
    if (isModal) {
      window.location.href = `/auth/verify-email-sent?${query.toString()}`;
    } else {
      router.push(`/auth/verify-email-sent?${query.toString()}`);
    }
  };

  return (
    <AuthCard
      description="Create your account to save favorites and reach out to agents."
      footer={
        <p className="text-center text-sm text-neutral-600">
          Already have an account?{" "}
          {/* oxlint-disable-next-line nextjs/no-html-link-for-pages "Because of the parallel route rendering a modal, we have to hard reload the page to show the sign up form" */}
          <a
            className="font-medium text-neutral-900 underline"
            href="/auth/sign-in"
            onClick={(event) => {
              if (isModal) {
                event.preventDefault();
                router.replace(`/auth/sign-in`);
              }
            }}
          >
            Sign in
          </a>
        </p>
      }
      title="Create account"
      variant={isModal ? "modal" : "card"}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-neutral-800"
              htmlFor="signup-first-name"
            >
              First name
            </label>
            <Input
              autoComplete="given-name"
              id="signup-first-name"
              minLength={2}
              onChange={(event) => onChange("firstName", event.target.value)}
              placeholder="John"
              required
              value={state.firstName}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-neutral-800"
              htmlFor="signup-last-name"
            >
              Last name
            </label>
            <Input
              autoComplete="family-name"
              id="signup-last-name"
              minLength={2}
              onChange={(event) => onChange("lastName", event.target.value)}
              placeholder="Doe"
              required
              value={state.lastName}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-800"
            htmlFor="signup-email"
          >
            Email
          </label>
          <Input
            autoComplete="email"
            id="signup-email"
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
            htmlFor="signup-password"
          >
            Password
          </label>
          <div className="relative">
            <Input
              autoComplete="new-password"
              className="pr-10"
              id="signup-password"
              minLength={8}
              onChange={(event) => onChange("password", event.target.value)}
              placeholder="Create a strong password"
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative text-center text-xs uppercase">
          <span className="bg-white px-2 text-neutral-500">
            or sign up with Google
          </span>
        </div>
      </div>
      <GoogleOAuthButton callbackURL="/" />
    </AuthCard>
  );
}
