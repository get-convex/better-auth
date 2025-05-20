# Convex Better Auth Component

[![npm version](https://badge.fury.io/js/@erquhart%2Fconvex-better-auth.svg)](https://badge.fury.io/js/@erquhart/convex-better-auth)

<!-- START: Include on https://convex.dev/components -->

Add comprehensive authentication to your Convex application. With this component, you get a complete auth solution that lives in your Convex database. The data is stored alongside the rest of your app's data, with full support for real-time updates and Convex's powerful features.

Supports email/password, social providers, magic links, two-factor authentication, and more—all with a type-safe API and real-time user data syncing.

**Full documentation and guides:** [convex-better-auth.netlify.app](https://convex-better-auth.netlify.app)

## Quickstart

Install the component and Better Auth:

```bash
npm install @erquhart/convex-better-auth better-auth@1.2.7
```

Add the component to your Convex backend:

```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import betterAuth from "@erquhart/convex-better-auth/convex.config";

const app = defineApp();
app.use(betterAuth);

export default app;
```

Set up your auth instance and register routes (see docs for details):

```ts
// convex/auth.ts
import { BetterAuth } from "@erquhart/convex-better-auth";
import { components } from "./_generated/api";

export const betterAuth = new BetterAuth(components.betterAuth, {
  /* options */
});
```

For full setup, usage, and advanced configuration, visit the docs:

👉 [convex-better-auth.netlify.app](https://convex-better-auth.netlify.app)

<!-- END: Include on https://convex.dev/components -->
