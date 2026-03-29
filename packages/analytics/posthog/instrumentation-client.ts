import posthog from "posthog-js";
import { keys } from "../keys";

export const initializeAnalytics = () => {
  const { NEXT_PUBLIC_POSTHOG_KEY } = keys();
  if (!NEXT_PUBLIC_POSTHOG_KEY) {
    console.warn(
      "PostHog key is not set. Analytics will be disabled. Please set NEXT_PUBLIC_POSTHOG_KEY in your environment variables.",
    );
    return;
  }
  posthog.init(NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/relay",
    ui_host: keys().NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    defaults: "2025-05-24",
  });
};
