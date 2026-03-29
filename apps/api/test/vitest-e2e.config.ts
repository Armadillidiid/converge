import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["reflect-metadata"],
    include: ["test/**/*.e2e-spec.ts"],
  },
  plugins: [swc.vite()],
  resolve: {
    alias: {
      "#src": new URL("../src", import.meta.url).pathname,
    },
  },
});
