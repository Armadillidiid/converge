import { keys as analytics } from "@repo/analytics/keys";
import { keys as core } from "@repo/next-config/keys";
import { keys as observability } from "@repo/observability/keys";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  extends: [analytics(), core(), observability()],
  server: {
    MAILCHIMP_API_KEY: z.string().min(1),
    MAILCHIMP_AUDIENCE_ID: z.string().min(1),
    WAITLIST_MODE: z.stringbool().optional(),
  },
  client: {
    NEXT_PUBLIC_API_BASE_URL: z.url(),
  },
  runtimeEnv: {
    MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY,
    MAILCHIMP_AUDIENCE_ID: process.env.MAILCHIMP_AUDIENCE_ID,
    WAITLIST_MODE: process.env.WAITLIST_MODE,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
