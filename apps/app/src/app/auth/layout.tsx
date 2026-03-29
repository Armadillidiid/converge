import { Suspense, type ReactNode } from "react";

type AuthLayoutProperties = {
  readonly children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProperties) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_#fef3c7_0%,_#fef9c3_24%,_#e3f4fc_58%)] px-4 py-12">
      <div className="pointer-events-none absolute -top-14 right-[-120px] h-72 w-72 rounded-full bg-amber-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[-140px] h-80 w-80 rounded-full bg-teal-200/35 blur-3xl" />
      <Suspense fallback={<div className="min-h-full flex-1" />}>
        {children}
      </Suspense>
    </main>
  );
}
