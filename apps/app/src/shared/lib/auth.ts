import { createAuthClient } from "@repo/auth/client";
import { env } from "@/env";
import {
  clearAuthTokenCookie,
  writeAuthTokenCookie,
  readAuthTokenFromDocumentCookie,
} from "./auth-token-cookie";

export const auth = createAuthClient({
  baseURL: `${env.NEXT_PUBLIC_API_BASE_URL}/auth`,
  fetchOptions: {
    credentials: "include",
    onError: () => {
      clearAuthTokenCookie();
    },
    onSuccess: (context) => {
      const token = context.response.headers.get("set-auth-token");

      if (!token) {
        return;
      }

      writeAuthTokenCookie(token);
    },
    auth: {
      type: "Bearer",
      token: () => {
        // In server environment, token will be set manually in the headers
        if (typeof window === "undefined") {
          return undefined;
        }
        const token = readAuthTokenFromDocumentCookie();
        return token ?? undefined;
      },
    },
  },
});
