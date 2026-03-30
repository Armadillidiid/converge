import { config, withAnalyzer } from "@repo/next-config";
import { withSentry } from "@repo/observability/next-config";
import type { NextConfig } from "next";
import { env } from "@/env";

let nextConfig: NextConfig = config;

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

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
        source: "/",
        destination: "/chat",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
