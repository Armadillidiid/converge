import { config, withAnalyzer } from "@repo/next-config";
import { withSentry } from "@repo/observability/next-config";
import type { NextConfig } from "next";
import { env } from "@/env";

let nextConfig: NextConfig = config;
const isWaitlistModeEnabled =
  env.WAITLIST_MODE ?? env.VERCEL_ENV === "production";

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

if (isWaitlistModeEnabled) {
  const previousRedirects = nextConfig.redirects;

  nextConfig = {
    ...nextConfig,
    async redirects() {
      const existingRedirects = previousRedirects
        ? typeof previousRedirects === "function"
          ? await previousRedirects()
          : previousRedirects
        : [];

      return [
        ...existingRedirects,
        {
          source:
            "/:path((?!$|privacy$|terms$|api(?:/.*)?$|_next(?:/.*)?$|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$).+)",
          destination: "/",
          permanent: false,
        },
      ];
    },
  };
}

export default nextConfig;
