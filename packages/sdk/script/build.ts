#!/usr/bin/env node

import { exec as cpExec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

import { createClient } from "@hey-api/openapi-ts";

const exec = promisify(cpExec);

const dir = new URL("..", import.meta.url).pathname;

// Generate OpenAPI spec
const apiDir = path.resolve(dir, "../../apps/api");
const outPath = path.join(dir, "openapi.json");
await exec(`pnpm run --silent gen:openapi > "${outPath}"`, { cwd: apiDir });

// Create TS client
await createClient({
  input: "./openapi.json",
  output: {
    path: "js/src/gen",
    importFileExtension: undefined,
    tsConfigPath: "off",
  },
  plugins: [
    { name: "@hey-api/typescript" },
    {
      name: "@hey-api/sdk",
      auth: false,
      operations: {
        strategy: "single",
        containerName: "ApiClient",
        methods: "instance",
      },
    },
    { name: "@tanstack/react-query" },
  ],
});

await exec("pnpm format", { cwd: dir });
