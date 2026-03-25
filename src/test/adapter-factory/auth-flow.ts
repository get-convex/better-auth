import type { Session, User } from "@better-auth/core/db";
import { createTestSuite } from "@better-auth/test-utils/adapter";
import { setCookieToHeader } from "better-auth/cookies";
import { expect } from "vitest";

export const AUTH_FLOW_DEFAULT_BETTER_AUTH_OPTIONS = {
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password: string) => password,
      async verify(data: { hash: string; password: string }) {
        return data.hash === data.password;
      },
    },
  },
};

export const getAuthFlowSuiteTests = (
  {
    generate,
    getAuth,
    modifyBetterAuthOptions,
    tryCatch,
  }: Parameters<Parameters<typeof createTestSuite>[2]>[0],
) => ({
  "should successfully sign up": async () => {
    const auth = await getAuth();
    const user = await generate("user");
    const result = await auth.api.signUpEmail({
      body: {
        email: user.email,
        password: crypto.randomUUID(),
        name: user.name,
        image: user.image || "",
      },
    });
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(user.email);
    expect(result.user.name).toBe(user.name);
    expect(result.user.image).toBe(user.image || "");
    expect(result.user.emailVerified).toBe(false);
    expect(result.user.createdAt).toBeDefined();
    expect(result.user.updatedAt).toBeDefined();
  },
  "should successfully sign in": async () => {
    const auth = await getAuth();
    const user = await generate("user");
    const password = crypto.randomUUID();
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: user.email,
        password,
        name: user.name,
        image: user.image || "",
      },
    });
    const result = await auth.api.signInEmail({
      body: { email: user.email, password },
    });
    expect(result.user).toBeDefined();
    expect(result.user.id).toBe(signUpResult.user.id);
  },
  "should successfully get session": async () => {
    const auth = await getAuth();
    const user = await generate("user");
    const password = crypto.randomUUID();
    const response = await auth.api.signUpEmail({
      body: {
        email: user.email,
        password,
        name: user.name,
        image: user.image || "",
      },
      asResponse: true,
    });
    const headers = new Headers();
    setCookieToHeader(headers)({ response });
    const result = await auth.api.getSession({
      headers,
    });
    const signUpResult = (await response.json()) as {
      user: User;
      session: Session;
    };
    signUpResult.user.createdAt = new Date(signUpResult.user.createdAt).getTime() as unknown as Date;
    signUpResult.user.updatedAt = new Date(signUpResult.user.updatedAt).getTime() as unknown as Date;
    expect(result?.user).toBeDefined();
    expect(result?.user).toStrictEqual(signUpResult.user);
    expect(result?.session).toBeDefined();
  },
  "should not sign in with invalid email": async () => {
    const auth = await getAuth();
    const user = await generate("user");
    const { data, error } = await tryCatch(
      auth.api.signInEmail({
        body: { email: user.email, password: crypto.randomUUID() },
      }),
    );
    expect(data).toBeNull();
    expect(error).toBeDefined();
  },
  "should store and retrieve timestamps correctly across timezones": async () => {
    const originalTZ = process.env.TZ;
    try {
      const auth = await getAuth();
      const user = await generate("user");
      const password = crypto.randomUUID();
      const userSignUp = await auth.api.signUpEmail({
        body: {
          email: user.email,
          password,
          name: user.name,
          image: user.image || "",
        },
      });
      process.env.TZ = "Europe/London";
      const userSignIn = await auth.api.signInEmail({
        body: { email: user.email, password },
      });
      process.env.TZ = "America/Los_Angeles";
      expect(userSignUp.user.createdAt).toStrictEqual(userSignIn.user.createdAt);
    } finally {
      if (originalTZ === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTZ;
      }
    }
  },
  "should sign up with additional fields": async () => {
    await modifyBetterAuthOptions(
      { user: { additionalFields: { dateField: { type: "date" } } } },
      true,
    );
    const auth = await getAuth();
    const user = await generate("user");
    const dateField = new Date();
    const response = await auth.api.signUpEmail({
      body: {
        email: user.email,
        name: user.name,
        password: crypto.randomUUID(),
        //@ts-expect-error - we are testing with additional fields
        dateField: dateField.toISOString(),
      },
      asResponse: true,
    });
    const headers = new Headers();
    setCookieToHeader(headers)({ response });
    const result = await auth.api.getSession({
      headers,
    });
    //@ts-expect-error - we are testing with additional fields
    expect(result?.user.dateField).toStrictEqual(dateField.getTime());
  },
});

/**
 * This test suite tests basic authentication flow using the adapter.
 */
export const authFlowTestSuite = createTestSuite(
  "auth-flow",
  {
    defaultBetterAuthOptions: AUTH_FLOW_DEFAULT_BETTER_AUTH_OPTIONS,
  },
  (helpers) => getAuthFlowSuiteTests(helpers),
);
