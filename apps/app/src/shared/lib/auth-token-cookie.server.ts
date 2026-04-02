import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE_NAME as APP_AUTH_TOKEN_COOKIE_NAME } from "./auth-token-cookie";

export const AUTH_TOKEN_COOKIE_NAME = APP_AUTH_TOKEN_COOKIE_NAME;

export const BETTER_AUTH_SESSION_COOKIE_NAME = "better-auth.session_token";

export async function readAuthTokenFromServerCookies(): Promise<
  string | undefined
> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value;
}

export async function readBetterAuthSessionTokenFromServerCookies(): Promise<
  string | undefined
> {
  const cookieStore = await cookies();
  return cookieStore.get(BETTER_AUTH_SESSION_COOKIE_NAME)?.value;
}

export async function readBearerTokenFromServerCookies(): Promise<
  string | undefined
> {
  const appToken = await readAuthTokenFromServerCookies();
  if (appToken) {
    return appToken;
  }

  return readBetterAuthSessionTokenFromServerCookies();
}
