export const AUTH_TOKEN_COOKIE_NAME = "converge_access_token";

export function readAuthTokenFromDocumentCookie(): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const cookie = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${AUTH_TOKEN_COOKIE_NAME}=`));

  if (!cookie) {
    return undefined;
  }

  const value = cookie.split("=").slice(1).join("=");
  return value ? decodeURIComponent(value) : undefined;
}

export function writeAuthTokenCookie(token: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const isSecure = window.location.protocol === "https:";
  const secure = isSecure ? "; Secure" : "";

  document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; SameSite=Lax${secure}`;
}

export function clearAuthTokenCookie(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
