import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    main: "src/main.ts",
    worker: "src/worker.ts",
  },
  format: ["esm"],
  platform: "node",
  outDir: "dist",
  outExtensions: () => ({ js: ".js" }),
  sourcemap: true,
  clean: true,
  // Bundle all internal workspace packages
  noExternal: [/^@repo\//],
  inlineOnly: false,
  // experimentalDecorators + emitDecoratorMetadata are read from tsconfig.json automatically
});
