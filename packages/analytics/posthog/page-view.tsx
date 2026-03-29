"use client";

import { useAnalytics } from "./client";
import { useEffect } from "react";

type PostHogPageViewProps = {
  pathname: string;
  searchParams: URLSearchParams;
};

export const PostHogPageView = ({
  pathname,
  searchParams,
}: PostHogPageViewProps) => {
  const analytics = useAnalytics();

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = `${url}?${searchParams.toString()}`;
      }
      analytics.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, analytics]);

  return null;
};
