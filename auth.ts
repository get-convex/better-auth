import { betterAuth } from "better-auth";
import {
  anonymous,
  emailOTP,
  magicLink,
  twoFactor,
  username,
} from "better-auth/plugins";
import { convex } from "@convex-dev/better-auth/plugins";
import { stripe } from "@better-auth/stripe";

// This is the config used to generate the schema
const config = betterAuth({
  rateLimit: {
    storage: "database",
  },
  plugins: [
    twoFactor(),
    magicLink({ sendMagicLink: async () => {} }),
    emailOTP({ sendVerificationOTP: async () => {} }),
    anonymous(),
    username(),
    stripe({
      stripeClient: {} as any,
      stripeWebhookSecret: '',
      subscription: {
        enabled: true,
        plans: []
      }
    }),
    convex(),
  ],
});
export { config as auth };

// Manually add fields to index on for schema generation,
// all fields in the schema specialFields are automatically indexed
export const indexFields = {
  user: ["userId", "name", ["email", "name"]],
  subscription: ["stripeCustomerId", "stripeSubscriptionId", "referenceId"],
  session: ["expiresAt", ["expiresAt", "userId"]],
  account: ["accountId", ["accountId", "providerId"], ["providerId", "userId"]],
  verification: ["expiresAt", "identifier"],
  rateLimit: ["key"],
};
