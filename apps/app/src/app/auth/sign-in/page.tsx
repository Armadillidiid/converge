import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInView } from "@modules/auth";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SignInView />
    </Suspense>
  );
}
