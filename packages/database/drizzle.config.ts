import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { keys } from "./keys";

export default defineConfig({
  out: "./drizzle",
  schema: "./schemas/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: keys().DB_URL!,
  },
});
