import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { router, commonSchemas } from "#src/app.contract.js";
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
    commonSchemas,
    ...(servers ? { servers } : {}),
  });

  const transcribeRequestBody =
    spec.paths?.["/ai/voice/transcribe"]?.post?.requestBody;

  if (
    transcribeRequestBody &&
    "content" in transcribeRequestBody &&
    transcribeRequestBody.content["multipart/form-data"]
  ) {
    transcribeRequestBody.content = {
      "multipart/form-data":
        transcribeRequestBody.content["multipart/form-data"],
    };
  }

  return spec;
};
