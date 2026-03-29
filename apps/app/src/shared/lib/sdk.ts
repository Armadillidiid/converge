import { client } from "@repo/sdk/client";
import { ApiClient } from "@repo/sdk";
import { env } from "@/env";
import { readAuthTokenFromDocumentCookie } from "./auth-token-cookie";

client.setConfig({
  baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
  credentials: "omit",
});

client.interceptors.request.use((request) => {
  if (typeof window === "undefined") {
    return request;
  }

  const token = readAuthTokenFromDocumentCookie();
  if (token) {
    request.headers.set("Authorization", `Bearer ${token}`);
  } else {
    request.headers.delete("Authorization");
  }

  return request;
});

export const sdkClient = new ApiClient({ client });
