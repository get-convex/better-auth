# Convex Better Auth Component

[![npm version](https://badge.fury.io/js/@erquhart%2Fconvex-better-auth.svg)](https://badge.fury.io/js/@erquhart%2Fconvex-better-auth)

This is a [Convex Component](https://convex.dev/components) that adds [Better Auth](https://www.better-auth.com/) to your Convex application, providing a comprehensive authentication solution with support for email/password, social providers, magic links, and more.

<!-- START: Include on https://convex.dev/components -->

Add comprehensive authentication to your Convex application. With this component, you get a beautiful developer experience and a complete auth solution that lives in your Convex database. The data is stored alongside the rest of your app's data, with full support for real-time updates and Convex's powerful features.

Just configure your auth providers, add this component to your Convex backend, and use the provided React hooks. All Better Auth features work out of the box, including email/password auth, social providers, magic links, and two-factor authentication.

Check out working example implementations in the [examples directory](https://github.com/erquhart/convex-better-auth/tree/main/examples) on GitHub:

- [Next.js Example](https://github.com/erquhart/convex-better-auth/tree/main/examples/next)
- [Vite Example](https://github.com/erquhart/convex-better-auth/tree/main/examples/vite)

TanStack example coming soon, but it should work similarly to the others.

Example usage, see [below](#usage) for more details:

```tsx
function AuthenticatedComponent() {
  const { user, signIn } = useAuth();
  return user ? (
    <div>Welcome, {user.email}!</div>
  ) : (
    <button onClick={() => signIn()}>Sign In</button>
  );
}
```

Features:

- Complete authentication solution with multiple auth methods
- Type-safe API with full TypeScript support
- Email/password authentication with verification
- Social auth providers (Google, GitHub, etc)
- Magic link and OTP code authentication
- Two-factor authentication (OTP, TOTP)
- Secure session management
- Real-time user data syncing
- Customizable user data with hooks
- Gradual migration support from existing auth systems

See [below](#api-reference) for the complete API reference and
[CONTRIBUTING.md](./CONTRIBUTING.md) for how to contribute.
Found a bug? Feature request? [File it here](https://github.com/erquhart/convex-better-auth/issues).

## Pre-requisite: Convex

You'll need an existing Convex project to use the component.
Convex is a hosted backend platform, including a database, serverless functions,
and a ton more you can learn about [here](https://docs.convex.dev/get-started).

Run `npm create convex` or follow any of the [quickstarts](https://docs.convex.dev/home) to set one up.

## Installation

Install the component and Better Auth:

```bash
npm install @erquhart/convex-better-auth better-auth@1.2.5
```

Create a `convex.config.ts` file in your app's `convex/` folder and install the component by calling `use`:

```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import betterAuth from "@erquhart/convex-better-auth/convex.config";

const app = defineApp();
app.use(betterAuth);

export default app;
```

## Usage

To use the component, first create a Better Auth instance in your backend:

```ts
// convex/auth.ts
import { BetterAuth } from "@erquhart/convex-better-auth";
import type { BetterAuthOptions } from "better-auth";
import { components, internal } from "./_generated/api";

export const betterAuth = new BetterAuth(
  components.betterAuth,
  {
    trustedOrigins: [process.env.SITE_URL as string],
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
    },
  },
  {
    onCreateUser: internal.myHooks.onCreateUser,
    onDeleteUser: internal.myHooks.onDeleteUser,
    onCreateSession: internal.myHooks.onCreateSession,
  }
);
```

Register route handlers:

```ts
// convex/http.ts
import { httpRouter } from "convex/server";
import { betterAuth } from "./auth";

const http = httpRouter();

betterAuth.registerRoutes(http, {
  allowedOrigins: [process.env.SITE_URL],
});

export default http;
```

Create a Better Auth client instance:

```ts
// lib/auth.ts
import { createAuthClient } from "@erquhart/convex-better-auth/react";

export const authClient = createAuthClient({
  // This should be your Convex site URL, which ends in .convex.site
  baseURL: "https://funky-penguin-123.convex.site",
});
```

Add to your Convex client using `ConvexProviderWithAuth`:

```tsx
// src/index.tsx
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useBetterAuth } from "@erquhart/convex-better-auth/react";
import { authClient } from "lib/auth.ts";

const convex = new ConvexReactClient(
  (
    <ConvexProviderWithAuth client={convex} useAuth={useBetterAuth(authClient)}>
      {children}
    </ConvexProviderWithAuth>
  )
);
```

## Working with Users

The Better Auth component maintains its own tables in your Convex database. There are two main approaches to working with user data:

### Using Component Tables Directly

If the default user fields (id, email, name, etc) are sufficient for your app:

```ts
// In your Convex functions
const user = await betterAuth.getAuthUser(ctx);
// user has: id, email, name, emailVerified, image, etc.
```

### Custom User Data

For apps that need additional user fields, create your own users table and use event hooks:

```ts
// convex/schema.ts
const schema = defineSchema({
  users: defineTable({
    authId: v.string(), // Reference to Better Auth user ID
    // Your custom fields
    role: v.string(),
    preferences: v.object({
      theme: v.string(),
      notifications: v.boolean(),
    }),
  }).index("authId", ["authId"]), // Important: index for efficient queries
});
```

Create event hooks to keep your data in sync:

```ts
// convex/userHooks.ts
import { userValidator } from "@erquhart/convex-better-auth";
import { internalMutation } from "./_generated/server";

export const onCreateUser = internalMutation({
  args: { user: userValidator },
  handler: async (ctx, { user }) => {
    await ctx.db.insert("users", {
      authId: user._id,
      role: "user",
      preferences: {
        theme: "light",
        notifications: true,
      },
    });
  },
});

export const onDeleteUser = internalMutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("authId", (q) => q.eq("authId", id))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});
```

## API Reference

### Auth Instance Methods

```ts
// Get the currently authenticated user's ID
const userId = await betterAuth.getAuthUserId(ctx);

// Get the currently authenticated user
const user = await betterAuth.getAuthUser(ctx);

// Get any user by ID - typically for admin functionality
const user = await betterAuth.getAnyUserById(ctx, id);

// You can also use the standard Convex ctx.auth method
const identity = await ctx.auth.getUserIdentity();
```

### Event Hooks

The component provides hooks for important authentication events:

```ts
// convex/myHooks.ts
import { userValidator, sessionValidator } from "@erquhart/convex-better-auth";
import { internalMutation } from "./_generated/server";

export const onCreateUser = internalMutation({
  args: { user: userValidator },
  handler: async (ctx, { user }) => {
    // Handle user creation
  },
});

export const onDeleteUser = internalMutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    // Handle user deletion
  },
});

export const onCreateSession = internalMutation({
  args: { session: sessionValidator },
  handler: async (ctx, { session }) => {
    // Handle session creation
  },
});
```

Configure hooks in your Better Auth instance:

```ts
export const betterAuth = new BetterAuth(
  components.betterAuth,
  { ...options },
  {
    onCreateUser: internal.myHooks.onCreateUser,
    onDeleteUser: internal.myHooks.onDeleteUser,
    onCreateSession: internal.myHooks.onCreateSession,
  }
);
```

<!-- END: Include on https://convex.dev/components -->

## Running the examples locally

In your terminal, run:

```sh
npm install
cd examples/next # or examples/vite
npm install
# Involves signing into Convex if necessary and deploying to a Convex dev instance.
npm run dev
```
