const LOCAL_APP_ORIGIN = "http://localhost:3000";

function toHttpsOrigin(hostOrUrl: string): string {
  const trimmed = hostOrUrl.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/+$/, "");
  }

  return `https://${trimmed.replace(/\/+$/, "")}`;
}

export function resolveAuthBaseUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`;
  }

  const vercelEnv = process.env.VERCEL_ENV;
  const vercelPreviewHost = process.env.VERCEL_URL;
  const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (vercelEnv === "production" && vercelProductionHost) {
    return `${toHttpsOrigin(vercelProductionHost)}/api/auth`;
  }

  if (vercelPreviewHost) {
    return `${toHttpsOrigin(vercelPreviewHost)}/api/auth`;
  }

  if (vercelProductionHost) {
    return `${toHttpsOrigin(vercelProductionHost)}/api/auth`;
  }

  return `${LOCAL_APP_ORIGIN}/api/auth`;
}
