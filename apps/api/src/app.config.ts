import { envSchema } from "./env.js";

export type { AppConfig } from "./env.js";
export const appConfig = () => envSchema.parse(process.env);
