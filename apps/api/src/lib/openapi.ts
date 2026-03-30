import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { router } from "#src/app.contract.js";
import { _API_PREFIX } from "#src/env.js";

export const genOpenapiDocs = async () => {
  const generator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
  });

  const appPrefix = process.env["APP_PREFIX"] ?? _API_PREFIX;
  const servers = appPrefix ? [{ url: `/${appPrefix}` }] : undefined;

  const spec = await generator.generate(router, {
    info: {
      title: "Converge API",
      version: "1.0.0",
    },
    commonSchemas: {},
    ...(servers ? { servers } : {}),
  });

  return spec;
};
