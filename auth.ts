// This file re-exports the auth config for schema generation
import { Adapter } from "better-auth";
import { auth } from "./src/client/adapter";
import { emailOTP, magicLink, twoFactor } from "better-auth/plugins";

// Generate schema for drizzle, closest syntax to Convex schema
// AI can translate schema changes to Convex schema, just requires
// review for accuracy
const config = auth(() => ({ id: "drizzle" }) as Adapter, {
  plugins: [
    twoFactor(),
    magicLink({ sendMagicLink: async () => {} }),
    emailOTP({ sendVerificationOTP: async () => {} }),
  ],
});
export { config as auth };
