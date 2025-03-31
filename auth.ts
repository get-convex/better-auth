// This file is a minimal betterAuth config for schema generation
import { bearer, jwt, oidcProvider } from "better-auth/plugins";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  plugins: [
    jwt(),
    bearer(),
    oidcProvider({
      loginPage: "/login-test",
    }),
  ],
  emailAndPassword: {
    enabled: true,
  },
  database: () => ({
    id: "drizzle",
  }),
});
