import type { Metadata } from "next";
import { VerifyEmailSentView } from "@modules/auth";

type VerifyEmailSentPageProperties = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Check your email",
};

export default async function VerifyEmailSentPage({
  searchParams,
}: VerifyEmailSentPageProperties) {
  const resolvedSearchParams = await searchParams;

  return <VerifyEmailSentView email={resolvedSearchParams.email} />;
}
