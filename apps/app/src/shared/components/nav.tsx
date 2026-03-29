"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import { buttonVariants } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/shared/lib/auth";
import { clearAuthTokenCookie } from "@/shared/lib/auth-token-cookie";

type SessionUser = {
  image?: string | null;
  name?: string | null;
};

export function Nav() {
  const router = useRouter();
  const { data, isPending } = auth.useSession();
  const sessionUser = (data?.user ?? null) as SessionUser | null;

  const handleSignOut = async () => {
    await auth.signOut();
    clearAuthTokenCookie();
    router.push("/");
  };

  const userName = sessionUser?.name ?? "Guest";
  const initials = userName
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link
          className="text-sm font-semibold tracking-[0.2em] text-neutral-700 uppercase"
          href="/"
        >
          Converge
        </Link>

        {isPending ? (
          <div className="h-8 w-24 animate-pulse rounded-md bg-neutral-200" />
        ) : sessionUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className={buttonVariants({
                    size: "sm",
                    variant: "outline",
                  })}
                >
                  <Avatar className="size-6">
                    <AvatarImage
                      alt={userName}
                      src={sessionUser.image ?? undefined}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  {userName}
                </button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => void handleSignOut()}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/auth/sign-in" className={buttonVariants({ size: "sm" })}>
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
