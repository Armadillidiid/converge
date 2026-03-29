"use client";

import posthog, { type PostHog } from "posthog-js";
import { PostHogProvider as PostHogProviderRaw } from "posthog-js/react";
import type { ReactNode } from "react";

type PostHogProviderProps = {
  readonly children: ReactNode;
};

export const PostHogProvider = ({ children }: PostHogProviderProps) => {
  return (
    <PostHogProviderRaw client={posthog as PostHog}>
      {children}
    </PostHogProviderRaw>
  );
};

export {
  usePostHog as useAnalytics,
  useFeatureFlagEnabled,
} from "posthog-js/react";
