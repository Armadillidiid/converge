import { openAPI } from "better-auth/plugins";
import { bearer } from "better-auth/plugins/bearer";
import { anonymous } from "better-auth/plugins";

export const plugins = [bearer(), openAPI(), anonymous()];
