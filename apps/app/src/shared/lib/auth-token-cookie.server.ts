import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE_NAME } from "./auth-token-cookie";

export async function readAuthTokenFromServerCookies(): Promise<
  string | undefined
> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value;
}
