import { betterAuth } from "better-auth/minimal";
import { options } from "./auth-options.js";

export const auth = betterAuth(options);
