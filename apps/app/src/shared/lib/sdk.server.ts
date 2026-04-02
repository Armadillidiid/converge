import { createConfig, createClient } from "@repo/sdk/client-core";
import { ApiClient } from "@repo/sdk";
import { env } from "@/env";
import { readBearerTokenFromServerCookies } from "./auth-token-cookie.server";

export async function createServerSdkClient() {
  const token = await readBearerTokenFromServerCookies();
  const client = createClient(
    createConfig({
      baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
      credentials: "omit",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  );

  return new ApiClient({ client });
}
