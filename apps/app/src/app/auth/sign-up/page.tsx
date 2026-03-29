import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUpView } from "@modules/auth";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SignUpView />
    </Suspense>
  );
}
