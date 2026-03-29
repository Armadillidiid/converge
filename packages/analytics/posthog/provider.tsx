"use client";

import type { ReactNode } from "react";
import { PostHogProvider } from "./client";

type AnalyticsProviderProps = {
  readonly children: ReactNode;
};

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  return <PostHogProvider>{children}</PostHogProvider>;
};
