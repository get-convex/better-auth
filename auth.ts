// This file re-exports the auth config for schema generation
import { Adapter, betterAuth } from "better-auth";
import { emailOTP, magicLink, twoFactor } from "better-auth/plugins";

// Generate schema for drizzle, closest syntax to Convex schema.
// AI can translate schema changes to Convex schema, just requires
// review for accuracy.
const config = betterAuth({
  database: () => ({ id: "drizzle" }) as Adapter,
  plugins: [
    twoFactor(),
    magicLink({ sendMagicLink: async () => {} }),
    emailOTP({ sendVerificationOTP: async () => {} }),
  ],
});
export { config as auth };
