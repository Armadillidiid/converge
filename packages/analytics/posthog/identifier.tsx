"use client";

import { useAnalytics } from "./client";
import { type Properties } from "posthog-js";
import { useEffect, useRef } from "react";

type PostHogIdentifierProps = {
  session?: Properties & { userId?: string };
};

export const PostHogIdentifier = ({ session }: PostHogIdentifierProps) => {
  const identified = useRef(false);
  const analytics = useAnalytics();

  useEffect(() => {
    if (!session || identified.current) {
      return;
    }

    analytics.identify(String(session.userId), session);

    identified.current = true;
  }, [session, analytics]);

  return null;
};
