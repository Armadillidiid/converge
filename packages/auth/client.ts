import { createAuthClient as createBetterAuthClient } from "better-auth/react";
import { type BetterAuthClientOptions } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { Auth } from "./server";
import { plugins } from "./plugins";

export function createAuthClient(options: BetterAuthClientOptions) {
  return createBetterAuthClient({
    ...options,
    plugins: [
      inferAdditionalFields<Auth>(),
      ...plugins,
      ...(options?.plugins ?? []),
    ],
  });
}
