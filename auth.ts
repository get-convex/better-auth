import { betterAuth, BetterAuthOptions } from "better-auth";
import {
  admin,
  anonymous,
  apiKey,
  bearer,
  captcha,
  emailOTP,
  genericOAuth,
  haveIBeenPwned,
  jwt,
  magicLink,
  mcp,
  multiSession,
  oAuthProxy,
  oidcProvider,
  oneTap,
  oneTimeToken,
  openAPI,
  organization,
  phoneNumber,
  siwe,
  twoFactor,
  username,
} from "better-auth/plugins";
import { convex } from "@convex-dev/better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { stripe } from "@better-auth/stripe";
import { sso } from "better-auth/plugins/sso";
import { polar } from "@polar-sh/better-auth";

// This is the config used to generate the schema
const options = {
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
    admin(),
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
    apiKey(),
    mcp({ loginPage: "/login" }),
    organization({ teams: { enabled: true } }),
    oidcProvider({
      loginPage: "/login",
    }),
    sso(),
    bearer(),
    captcha({
      provider: "google-recaptcha",
      secretKey: "",
    }),
    haveIBeenPwned(),
    multiSession(),
    oAuthProxy(),
    oneTimeToken(),
    openAPI(),
    jwt(),
    stripe({
      stripeClient: {} as any,
      stripeWebhookSecret: "",
      subscription: {
        enabled: true,
        plans: [],
      },
    }),
    polar({ client: {} as any, use: [] as any }),
    siwe({
      domain: "example.com",
      getNonce: async () => "",
      verifyMessage: async () => true,
    }),
    convex(),
  ],
} as BetterAuthOptions; // assert type to avoid overloading ts compiler
const config = betterAuth(options);
export { config as auth };

// Manually add fields to index on for schema generation,
// all fields in the schema specialFields are automatically indexed
export const indexFields = {
  account: ["accountId", ["accountId", "providerId"], ["providerId", "userId"]],
  rateLimit: ["key"],
  session: ["expiresAt", ["expiresAt", "userId"]],
  verification: ["expiresAt", "identifier"],
  user: [["email", "name"], "name", "userId"],
  passkey: ["credentialID"],
  apikey: ["key"],
  member: [["organizationId", "userId"]],
  invitation: [
    ["email", "organizationId", "status"],
    ["organizationId", "status"],
  ],
  oauthConsent: [["clientId", "userId"]],
  ssoProvider: ["organizationId", "domain"],
  subscription: ["stripeSubscriptionId", "stripeCustomerId", "referenceId"],
};

/*
export const deprecatedFields = {
  user: {
    teamId: {
  */
