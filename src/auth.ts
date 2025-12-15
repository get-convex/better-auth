import { betterAuth } from "better-auth";
import { options } from "./auth-options.js";

export const auth = betterAuth(options);
