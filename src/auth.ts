import { betterAuth, type BetterAuthOptions } from "better-auth";
import {
  anonymous,
  bearer,
  emailOTP,
  genericOAuth,
  jwt,
  magicLink,
  oidcProvider,
  oneTap,
  oneTimeToken,
  phoneNumber,
  twoFactor,
  username,
} from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { convex } from "./plugins/convex/index.js";
import { convexAdapter } from "./client/adapter.js";

// This is the config used to generate the schema
const options = {
  logger: {
    disabled: true,
  },
  database: convexAdapter({} as any, {} as any),
  // Random secret to keep Better Auth happy, not actually used - the database
  // adapter above has no function handles passed in, so it's unable to interact
  // with the database.
  secret: "5csVL9Xi8upm96F7Qgv3e955dEaY6diFY2hFjPRvuyo=",
  rateLimit: {
    storage: "database",
  },
  plugins: [
    twoFactor(),
    anonymous(),
    username(),
    phoneNumber(),
    magicLink({ sendMagicLink: async () => {} }),
    emailOTP({ sendVerificationOTP: async () => {} }),
    passkey(),
    genericOAuth({
      config: [
        {
          clientId: "",
          clientSecret: "",
          providerId: "",
        },
      ],
    }),
    oneTap(),
    oidcProvider({
      loginPage: "/login",
    }),
    bearer(),
    oneTimeToken(),
    jwt(),
    convex({
      authConfig: { providers: [{ applicationID: "convex", domain: "" }] },
    }),
  ],
} as BetterAuthOptions; // assert type to avoid overloading ts compiler
const config = betterAuth(options) as ReturnType<typeof betterAuth>;
export { options, config as auth };
