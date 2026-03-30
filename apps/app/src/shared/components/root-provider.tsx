"use client";

import { AnalyticsProvider } from "@repo/analytics/client";
import { PostHogPageView } from "@repo/analytics/client";
import { DesignSystemProvider } from "@repo/design-system";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode, Suspense } from "react";
import "@/shared/lib/sdk";

import { getQueryClient } from "@lib/tanstack-query";

const PageView = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return <PostHogPageView pathname={pathname} searchParams={searchParams} />;
};

const RootProviders = ({ children }: { children: ReactNode }) => {
  const queryClient = getQueryClient();

  return (
    <AnalyticsProvider>
      <DesignSystemProvider forcedTheme="dark">
        <QueryClientProvider client={queryClient}>
          <Suspense>
            <PageView />
          </Suspense>
          {children}
          <ReactQueryDevtools buttonPosition="bottom-right" />
        </QueryClientProvider>
      </DesignSystemProvider>
    </AnalyticsProvider>
  );
};

export default RootProviders;
