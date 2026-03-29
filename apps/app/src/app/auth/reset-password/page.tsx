import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordView } from "@modules/auth";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ResetPasswordView />
    </Suspense>
  );
}
