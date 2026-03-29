import {
  Card,
  CardContent,
  CardHeader,
} from "@repo/design-system/components/ui/card";
import type { ReactNode } from "react";

type AuthCardProperties = {
  description?: string;
  footer?: ReactNode;
  title: string;
  children: ReactNode;
  variant?: "card" | "modal";
};

export function AuthCard({
  description,
  footer,
  title,
  children,
  variant = "card",
}: AuthCardProperties) {
  const isModal = variant === "modal";

  return (
    <Card
      className={`w-full sm:max-w-md ${
        isModal
          ? "border-0 bg-transparent shadow-none"
          : "border-neutral-200 bg-white/95 shadow-lg"
      }`}
    >
      <CardHeader className="space-y-3 pb-0">
        <p className="text-xs font-semibold tracking-[0.24em] text-neutral-500 uppercase">
          Converge
        </p>
        <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
        {description ? (
          <p className="text-sm text-neutral-600">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
      {footer ? <div className="px-6 pb-6">{footer}</div> : null}
    </Card>
  );
}
