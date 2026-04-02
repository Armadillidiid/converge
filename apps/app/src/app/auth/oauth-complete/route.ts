import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_TOKEN_COOKIE_NAME,
  BETTER_AUTH_SESSION_COOKIE_NAME,
} from "@/shared/lib/auth-token-cookie.server";

function normalizeNextPath(nextPath: string | null): string {
  if (!nextPath) {
    return "/chat";
  }

  if (nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    return nextPath;
  }

  return "/chat";
}

export async function GET(request: NextRequest) {
  const nextPath = normalizeNextPath(request.nextUrl.searchParams.get("next"));
  const betterAuthSessionToken = request.cookies.get(
    BETTER_AUTH_SESSION_COOKIE_NAME,
  )?.value;

  const response = NextResponse.redirect(new URL(nextPath, request.url));

  if (betterAuthSessionToken) {
    response.cookies.set(AUTH_TOKEN_COOKIE_NAME, betterAuthSessionToken, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
