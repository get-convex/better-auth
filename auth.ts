import { betterAuth } from "better-auth";
import {
  anonymous,
  emailOTP,
  magicLink,
  twoFactor,
  username,
} from "better-auth/plugins";
import { convex } from "@convex-dev/better-auth/plugins";

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
    convex(),
  ],
});
export { config as auth };

// Set fields to index on for schema generation
export const indexFields = {
  user: ["email", "userId", "username"],
  session: ["token", "userId", "expiresAt", ["expiresAt", "userId"]],
  account: [
    "userId",
    "accountId",
    ["accountId", "providerId"],
    ["providerId", "userId"],
  ],
  twoFactor: ["userId"],
  verification: ["expiresAt", "identifier"],
  rateLimit: ["key"],
};
