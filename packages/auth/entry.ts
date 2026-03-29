import { createAuth } from "./server";

// NOTE: This file is only used by better-auth CLI to generate database schema when running `pnpm dlx auth@latest migrate`.
// @ts-expect-error "db" and "redis" are required, but we don't need them for schema generation.
export const auth = createAuth({ db: "", redis: "" });
