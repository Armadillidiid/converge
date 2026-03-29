import "server-only";
import { PostHog } from "posthog-node";
import { keys } from "../keys";

export const createServerAnalytics = () => {
  const key = keys().NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) throw new Error("PostHog cannot be initialized without a token");

  const client = new PostHog(key, {
    host: keys().NEXT_PUBLIC_POSTHOG_HOST,

    // Don't batch events and flush immediately - we're running in a serverless environment
    flushAt: 1,
    flushInterval: 0,
  });

  return {
    alias: (...parameters: Parameters<PostHog["alias"]>) =>
      client.alias(...parameters),
    capture: (...parameters: Parameters<PostHog["capture"]>) =>
      client.capture(...parameters),
    identify: (...parameters: Parameters<PostHog["identify"]>) =>
      client.identify(...parameters),
    shutdown: (...parameters: Parameters<PostHog["shutdown"]>) =>
      client.shutdown(...parameters),
  };
};
