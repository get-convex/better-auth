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
import { convex } from "./plugins/convex/index.js";
import { passkey } from "@better-auth/passkey";
import { convexAdapter } from "./client/adapter.js";

// This is the config used to generate the schema
const options = {
  logger: {
    disabled: true,
  },
  database: convexAdapter({} as any, {} as any),
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
    convex(),
  ],
} as BetterAuthOptions; // assert type to avoid overloading ts compiler
const config = betterAuth(options) as ReturnType<typeof betterAuth>;
export { config as auth };
