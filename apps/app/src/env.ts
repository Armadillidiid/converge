import { keys as analytics } from "@repo/analytics/keys";
import { keys as core } from "@repo/next-config/keys";
import { keys as observability } from "@repo/observability/keys";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  extends: [analytics(), core(), observability()],
  client: {
    NEXT_PUBLIC_API_BASE_URL: z.url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
