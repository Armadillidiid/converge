import { VersioningType } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { type Auth } from "@repo/auth/server";
import { toNodeHandler } from "better-auth/node";
import type { AppConfig } from "./app.config.js";
import { AuthService } from "./modules/better-auth/auth.service.js"; // tsconfig-path does not work in this file, so we have to use a relative path here.

export async function bootstrap(app: NestExpressApplication) {
  const httpAdapter = app.getHttpAdapter();
  const configService = app.get(ConfigService<AppConfig, true>);

  const origin = configService.get("APP_TRUSTED_ORIGINS", { infer: true });
  const shouldReflectOrigin = origin.includes("*");
  app.enableShutdownHooks();

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const rawPrefix = configService.get("APP_PREFIX", {
    infer: true,
  });
  const normalizedPrefix = rawPrefix?.replace(/^\/+|\/+$/g, "");

  if (normalizedPrefix) {
    app.setGlobalPrefix(normalizedPrefix);
  }

  const authBasePath = normalizedPrefix ? `/${normalizedPrefix}/auth` : "/auth";

  app.enableCors({
    origin: shouldReflectOrigin ? true : origin,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: ["Authorization", "Content-Type"],
    exposedHeaders: ["set-auth-token"],
    credentials: false,
  });

  // Register Better Auth directly on the Express adapter.
  const authInstance = app.get(AuthService<Auth>).instance;
  app.use(authBasePath, toNodeHandler(authInstance));

  const { genOpenapiDocs } = await import("./lib/openapi.js");
  const { apiReference } = await import("@scalar/nestjs-api-reference");

  app.use(
    "/docs",
    apiReference({
      sources: [
        { content: await genOpenapiDocs(), title: "Main API" },
        {
          // Document refuses to load via url so we pass it as content
          content: await authInstance.api.generateOpenAPISchema(),
          title: "Auth",
        },
      ],
    }),
  );

  return {
    app,
    instance: httpAdapter.getInstance(),
  };
}
