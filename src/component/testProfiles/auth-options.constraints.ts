import type { BetterAuthOptions } from "better-auth/minimal";
import { options } from "../../auth-options.js";

// Exercise custom required fields and compound uniqueness independently of
// Better Auth's core account schema, which no longer requires issuer in 1.7.3+.
export const constraintsProfileOptions = {
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    {
      id: "test-account-constraints",
      schema: {
        account: {
          fields: { issuer: { type: "string", required: true } },
          indexes: [{ fields: ["issuer", "accountId"], unique: true }],
        },
      },
    },
  ],
} satisfies BetterAuthOptions;
