import { ConfigurableModuleBuilder } from "@nestjs/common";
import type { Auth } from "@repo/auth/server";
import { MODULE_OPTIONS_TOKEN } from "./constants.js";

export type AuthModuleOptions<A = Auth> = {
  auth: A;
};

export const { ConfigurableModuleClass, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<AuthModuleOptions>({
    optionsInjectionToken: MODULE_OPTIONS_TOKEN,
  })
    .setClassMethodName("forRoot")
    .setExtras({}, (def) => ({
      ...def,
      exports: [MODULE_OPTIONS_TOKEN],
    }))
    .build();
