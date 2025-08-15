"use client";

import { useState } from "react";

export default function ConvexBetterAuthGuideNextjs() {
  const [isExpanded, setIsExpanded] = useState(false);

  const guideContent = `### These are steps to setup better auth with convex and nextjs

# 1. Install the dependencies

\`\`\`bash
npm install @convex-dev/better-auth
npm install better-auth@1.2.12 --save-exact
npm install convex@latest
\`\`\`

# 2. Add a convex/auth.config.ts file to configure Better Auth as an authentication provider

\`\`\`ts
// convex/auth.config.ts
export default {
  providers: [
    {
      // Your Convex site URL is provided in a system
      // environment variable
      domain: process.env.CONVEX_SITE_URL,

      // Application ID has to be "convex"
      applicationID: "convex",
    },
  ],
};
\`\`\`

# 3. Add the Better Auth plugin to your Convex app configuration

\`\`\`ts
// convex/convex.config.ts
import { defineApp } from 'convex/server'
import betterAuth from '@convex-dev/better-auth/convex.config'

const app = defineApp()
app.use(betterAuth)

export default app
\`\`\`

# 4. Generate a secret for encryption and generating hashes.

TIP: Make sure to check which port your Next.js app is running on (typically 3000) and adjust the BETTER_AUTH_URL accordingly

\`\`\`bash
npx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
npx convex env set BETTER_AUTH_URL=http://localhost:3000
\`\`\`

# 5. Add the Convex site URL environment variable to the .env.local file created by npx convex dev. It will be picked up by your framework dev server.

\`\`\`bash
# Deployment used by \`npx convex dev\`
CONVEX_DEPLOYMENT=dev:adjective-animal-123 # team: team-name, project: project-name

NEXT_PUBLIC_CONVEX_URL=https://adjective-animal-123.convex.cloud

# Same as NEXT_PUBLIC_CONVEX_URL but ends in .site
NEXT_PUBLIC_CONVEX_SITE_URL=https://adjective-animal-123.convex.site
\`\`\`

# 6. First, add a users table to your schema. Name it whatever you like. Better Auth has its own user table that tracks basic user data, so your application user table only needs fields specific to your app (or none at all).

\`\`\`ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  users: defineTable({
    // Fields are optional
  }),
});
\`\`\`

# 7. Create your Better Auth instance.

\`\`\`ts
// convex/lib/auth.ts
import { convexAdapter } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { betterAuthComponent } from "../convex/auth";
import { type GenericCtx } from "../convex/_generated/server";

// You'll want to replace this with an environment variable
const siteUrl = "http://localhost:3000";

export const createAuth = (ctx: GenericCtx) =>
  // Configure your Better Auth instance here
  betterAuth({
    // All auth requests will be proxied through your next.js server
    baseURL: siteUrl,
    database: convexAdapter(ctx, betterAuthComponent),

    // Simple non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      // The Convex plugin is required
      convex(),
    ],
  });
\`\`\`

\`\`\`ts
// convex/auth.ts
import {
  BetterAuth,
  type AuthFunctions,
  type PublicAuthFunctions,
} from "@convex-dev/better-auth";
import { api, components, internal } from "./_generated/api";
import { query } from "./_generated/server";
import type { Id, DataModel } from "./_generated/dataModel";

// Typesafe way to pass Convex functions defined in this file
const authFunctions: AuthFunctions = internal.auth;
const publicAuthFunctions: PublicAuthFunctions = api.auth;

// Initialize the component
export const betterAuthComponent = new BetterAuth(components.betterAuth, {
  authFunctions,
  publicAuthFunctions,
});

// These are required named exports
export const {
  createUser,
  updateUser,
  deleteUser,
  createSession,
  isAuthenticated,
} = betterAuthComponent.createAuthFunctions<DataModel>({
  // Must create a user and return the user id
  onCreateUser: async (ctx, user) => {
    return ctx.db.insert("users", {});
  },

  // Delete the user when they are deleted from Better Auth
  onDeleteUser: async (ctx, userId) => {
    await ctx.db.delete(userId as Id<"users">);
  },
});

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get user data from Better Auth - email, name, image, etc.
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata) {
      return null;
    }
    // Get user data from your application's database
    // (skip this if you have no fields in your users table schema)
    const user = await ctx.db.get(userMetadata.userId as Id<"users">);
    return {
      ...user,
      ...userMetadata,
    };
  },
});
\`\`\`

# 8. Create a Better Auth client instance for interacting with the Better Auth server from your client.

\`\`\`ts
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [convexClient()],
});
\`\`\`

# 9. Register Better Auth route handlers on your Convex deployment.

\`\`\`ts
import { httpRouter } from "convex/server";
import { betterAuthComponent } from "./auth";
import { createAuth } from "../lib/auth";

const http = httpRouter();

betterAuthComponent.registerRoutes(http, createAuth);

export default http;
\`\`\`

# 10. Set up route handlers to proxy auth requests from your framework server to your Convex deployment.

\`\`\`ts
import { nextJsHandler } from "@convex-dev/better-auth/nextjs";

export const { GET, POST } = nextJsHandler();
\`\`\`

# 11. Wrap your app with the ConvexBetterAuthProvider component.

\`\`\`ts
"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
\`\`\``;

  const previewContent = `### These are steps to setup better auth with convex and nextjs

# 1. Install the dependencies

\`\`\`bash
npm install @convex-dev/better-auth
npm install better-auth@1.2.12 --save-exact
npm install convex@latest
\`\`\`

# 2. Add a convex/auth.config.ts file to configure Better Auth...

... and 9 more steps`;

  return (
    <div className="max-w-none">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">LLM Instructions: Convex Better Auth Setup (Next.js)</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Copy and paste these instructions to any LLM (Claude code, Cursor, Windsurf, etc.) to set up better auth with convex.
        </p>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        {/* Header with toggle and copy button */}
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {isExpanded ? 'Hide Guide' : 'Show Complete Guide (11 steps)'}
          </button>
          
          <button
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={() => navigator.clipboard.writeText(guideContent)}
          >
            Copy Instructions
          </button>
        </div>

        {/* Content */}
        <div className="relative">
          <pre className="bg-gray-100 dark:bg-gray-800 p-6 overflow-x-auto text-sm">
            <code className="whitespace-pre-wrap">
              {isExpanded ? guideContent : previewContent}
            </code>
          </pre>
          
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-100 dark:from-gray-800 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Footer when collapsed */}
        {!isExpanded && (
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t">
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Click to view all 11 steps →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
