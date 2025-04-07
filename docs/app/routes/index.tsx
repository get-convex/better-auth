import * as fs from "node:fs";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  Link as LinkIcon,
  Check,
  Info,
  AlertCircle,
  X,
  ChevronDown,
} from "lucide-react";
import DocsLayout, { SmoothScrollLink } from "@/components/docs-layout";
import { CodeBlock } from "@/components/code-block";
import { stripIndent } from "common-tags";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function SectionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollLink
      href={href}
      className="inline-flex items-center rounded-md -ml-2 px-2 py-1 cursor-pointer hover:bg-muted/50 transition-colors group"
    >
      {children}
      <LinkIcon className="ml-2 size-4 opacity-0 group-hover:opacity-50 transition-opacity" />
    </SmoothScrollLink>
  );
}

// Simple collapsible component
function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="w-full rounded-md border border-muted/60 bg-background/50 hover:bg-accent/30 transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-3 px-4 text-left focus:outline-none"
      >
        <span className="text-muted-foreground font-medium">{title}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground/70 transition-transform duration-200",
            isOpen ? "transform rotate-180" : ""
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out px-4",
          isOpen ? "max-h-[1000px] opacity-100 pb-4" : "max-h-0 opacity-0 pb-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

const filePath = "count.txt";

async function readCount() {
  return parseInt(
    await fs.promises.readFile(filePath, "utf-8").catch(() => "0")
  );
}

const getCount = createServerFn({
  method: "GET",
}).handler(() => {
  return readCount();
});

/*
const updateCount = createServerFn({ method: "POST" })
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    const count = await readCount();
    await fs.promises.writeFile(filePath, `${count + data}`);
  });
  */

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await getCount(),
});

function Home() {
  /*
  const router = useRouter();
  const state = Route.useLoaderData();
  */

  return (
    <DocsLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="py-8 sm:py-20 space-y-6 sm:space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-[rgb(243,176,28)] from-30% to-[#FF3366] to-100% bg-clip-text text-transparent">
              Convex
            </h1>
            <span className="text-3xl sm:text-4xl font-light text-muted-foreground">
              +
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Better Auth
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Own your auth in your Convex applications. Comprehensive, secure
            authentication and a beautiful developer experience with Better
            Auth. Built for modern TypeScript applications with real-time data
            sync.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-2">
            <SmoothScrollLink
              href="#getting-started"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Get Started
            </SmoothScrollLink>
            <a
              href="https://github.com/erquhart/convex-better-auth"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-2 mb-10 flex gap-3 rounded-md border bg-muted/50 p-4">
          <div className="select-none text-primary">💡</div>
          <div className="text-muted-foreground">
            <p>
              Check out working example implementations in the{" "}
              <a
                href="https://github.com/erquhart/convex-better-auth/tree/main/examples"
                className="text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                examples directory
              </a>{" "}
              on GitHub, including setups for Next.js and Vite. TanStack coming
              soon, but it should work similarly to the others.
            </p>
          </div>
        </div>

        <section id="alpha-status" className="py-6">
          <div className="p-6 rounded-lg border bg-muted/50 space-y-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
              <h2 className="text-2xl font-bold text-yellow-500">
                Alpha Status
              </h2>
            </div>

            <p className="text-muted-foreground">
              The Convex Better Auth component is in early alpha development.
            </p>

            <Collapsible title="Read more about current limitations and compatibility">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  The challenge for this component is that Better Auth is
                  designed to generate dynamic queries for traditional
                  databases, and Convex is... not a traditional database. It's
                  way better. Which is why it will eventually take over the
                  world, but that's just one man's opinion. Sorry, getting off
                  track here. Anywho. While dynamic queries are somewhat
                  possible in Convex, dynamic <em>indexes</em> are not, so
                  dynamic queries have to be supported by a set of predefined
                  indexes.
                </p>

                <p className="text-muted-foreground">
                  All of this means that the Better Auth component has to
                  support specific plugins and features intentionally, and there
                  will always be a set of known working plugins/features, while
                  others may or may not run into errors.
                </p>
              </div>
            </Collapsible>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-800/20 flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-xl font-medium text-green-500">
                    Known To Work
                  </h3>
                </div>
                <ul className="space-y-3 ml-2.25">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Basic functionality
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Email / Password Auth
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Social Auth (Google, GitHub, etc)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Magic Link / OTP Code Auth
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Two Factor (OTP, TOTP)
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-800/20 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-medium text-amber-500">
                    Might Not Work
                  </h3>
                </div>
                <ul className="space-y-3 ml-2.25">
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Plugins not listed under "known to work"
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-800/20 flex items-center justify-center">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-xl font-medium text-red-500">
                  Not Currently Supported
                </h3>
              </div>
              <ul className="space-y-3 ml-2.25">
                <li className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Plugins not listed above that include a migration step
                    (indicated in Better Auth docs) are almost guaranteed not to
                    work.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    JWT and OIDC plugins probably won't work, preconfigured
                    versions are already in use for Convex support
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-600/20 flex items-center justify-center">
                  <Info className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-medium text-white">
                  Issues and Feedback
                </h3>
              </div>
              <p className="text-muted-foreground ml-2.25">
                If your use case isn't supported, a plugin doesn't work, you hit
                a bug, etc, please open a{" "}
                <a
                  href="https://github.com/erquhart/convex-better-auth/issues"
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub issue
                </a>{" "}
                or reach out on{" "}
                <a
                  href="https://discord.gg/convex"
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Discord
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        <section id="getting-started" className="py-16">
          <h2 className="text-3xl font-bold mb-8">
            <SectionLink href="#getting-started">Getting Started</SectionLink>
          </h2>
          <p className="mb-12 text-lg">
            This library is a{" "}
            <a href="https://www.convex.dev/components" className="underline">
              Convex Component
            </a>
            . Components have their own tables and functions that are separate
            from those of your application, but are still able to interact with
            them in specific ways. This allows Better Auth to run securely in
            your Convex database, but without direct access to your application
            data, and with it's own space in the dashboard.
          </p>

          <div className="space-y-12">
            <div>
              <h3 id="installation" className="text-2xl font-bold mb-6">
                <SectionLink href="#installation">Installation</SectionLink>
              </h3>
              <p className="mb-8">
                To get started, install the component and a pinned version of
                Better Auth.
              </p>

              <CodeBlock
                language="bash"
                code="npm install @erquhart/convex-better-auth better-auth@1.2.5"
              />
            </div>

            <div>
              <p className="mb-8">Add the component to your application.</p>

              <CodeBlock
                language="typescript"
                filename="convex/convex.config.ts"
                highlightedLines={[2, 5]}
                code={stripIndent`
                  import { defineApp } from 'convex/server'
                  import betterAuth from '@erquhart/convex-better-auth/convex.config'

                  const app = defineApp()
                  app.use(betterAuth)

                  export default app
                `}
              />
            </div>

            <div>
              <h3 id="setup-better-auth" className="text-2xl font-bold mb-6">
                <SectionLink href="#setup-better-auth">
                  Set up Better Auth
                </SectionLink>
              </h3>
              <p className="mb-4">
                Create a Better Auth instance in your backend.
              </p>
              <div className="mb-6 flex gap-3 rounded-md border bg-muted/50 p-4">
                <div className="select-none text-primary">💡</div>
                <p className="text-sm text-muted-foreground">
                  Keeping the Better Auth instance in a separate file like{" "}
                  convex/auth.ts is recommended for better organization, but it
                  will work from any file in the Convex directory.
                </p>
              </div>

              <CodeBlock
                language="typescript"
                filename="convex/auth.ts"
                code={stripIndent`
                  import { BetterAuth } from '@erquhart/convex-better-auth'
                  import type { BetterAuthOptions } from 'better-auth'
                  import { components, internal } from './_generated/api'

                  export const betterAuth: BetterAuth = new BetterAuth(
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
                  )
                `}
              />
            </div>

            <div>
              <p className="mb-8">Register route handlers.</p>

              <CodeBlock
                language="typescript"
                filename="convex/http.ts"
                highlightedLines={[2, 6, 7, 8]}
                code={stripIndent`
                  import { httpRouter } from 'convex/server'
                  import { betterAuth } from './auth'

                  const http = httpRouter()

                  betterAuth.registerRoutes(http, {
                    allowedOrigins: [process.env.SITE_URL],
                  })

                  export default http
                `}
              />
            </div>

            <div>
              <h3 id="setup-client" className="text-2xl font-bold mb-6">
                <SectionLink href="#setup-client">Set up client</SectionLink>
              </h3>
              <p className="mb-4">Create a Better Auth client instance.</p>
              <div className="mb-6 flex gap-3 rounded-md border bg-muted/50 p-4">
                <div className="select-none text-primary">💡</div>
                <p className="text-sm text-muted-foreground">
                  Be sure to import <code>createAuthClient</code> from the
                  component, not directly from the better-auth package.
                </p>
              </div>

              <CodeBlock
                language="typescript"
                filename="lib/auth.ts"
                code={stripIndent`
                  import { createAuthClient } from '@erquhart/convex-better-auth/react'

                  export const authClient = createAuthClient({
                    // This should be your Convex site URL, which ends in .convex.site
                    baseURL: 'https://funky-penguin-123.convex.site'
                  })
                `}
              />

              <p className="mb-8">
                Add to Convex client using `ConvexProviderWithAuth` instead of
                `ConvexProvider`. The specific file this happens in will depend
                on your framework.
              </p>

              <CodeBlock
                language="typescript"
                filename="src/index.tsx"
                code={stripIndent`
                  import { ConvexProviderWithAuth, ConvexReactClient } from 'convex/react'
                  import { useBetterAuth } from '@erquhart/convex-better-auth/react'
                  import { authClient } from 'lib/auth.ts'

                  const convex = new ConvexReactClient(
                    <ConvexProviderWithAuth client={convex} useAuth={useBetterAuth(authClient)}>
                      {children}
                    </ConvexProviderWithAuth>
                  )
                `}
              />
            </div>
          </div>
        </section>

        <section id="basic-usage" className="py-16">
          <h2 className="text-3xl font-bold mb-8">
            <SectionLink href="#basic-usage">Basic Usage</SectionLink>
          </h2>

          <div className="space-y-12">
            <p className="text-lg">
              Better Auth provides comprehensive documentation for all its
              features. You can use all Better Auth features exactly as
              documented in the{" "}
              <a
                href="https://www.better-auth.com/docs/basic-usage"
                className="text-primary underline"
              >
                Better Auth documentation
              </a>
              , including email/password auth, social providers, magic links,
              and more.
            </p>

            <div>
              <h3 id="working-with-users" className="text-2xl font-bold mb-6">
                <SectionLink href="#working-with-users">
                  Working with Users
                </SectionLink>
              </h3>
              <p className="text-lg mb-8">
                The Better Auth component maintains its own tables in your
                Convex database, including a users table. There are two main
                approaches to working with user data:
              </p>

              <div className="space-y-16">
                <div>
                  <h4 className="text-xl font-semibold mb-4">
                    1. Using Component Tables Directly
                  </h4>
                  <p className="text-muted-foreground mb-6">
                    If the default user fields (id, email, name, etc) are
                    sufficient for your app, you can work directly with the
                    component's users table using the provided methods:
                  </p>
                  <CodeBlock
                    language="typescript"
                    code={stripIndent`
                      // In your Convex functions
                      const user = await betterAuth.getAuthUser(ctx)
                      // user has: id, email, name, emailVerified, image, etc.
                    `}
                  />
                </div>

                <div>
                  <h4 className="text-xl font-semibold mb-4">
                    2. Custom User Data
                  </h4>
                  <p className="text-muted-foreground mb-8">
                    For apps that need additional user fields, create your own
                    users table and use the event hooks to keep it synchronized
                    with the component's table.
                  </p>
                  <div className="mt-8 mb-8 flex gap-3 rounded-md border bg-muted/50 p-4">
                    <div className="select-none text-primary">💡</div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-2">Transactional Safety</p>
                      <p>
                        Because Convex mutations are atomic, the event hooks run
                        within the same transaction as the component's user
                        creation/deletion. This means your app's user records
                        will always stay in sync - if the hook fails, the entire
                        operation is rolled back.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div>
                      <p className="mb-4 text-muted-foreground">
                        First, define your app's users table in your schema.
                        Include an <code>authId</code> field to reference the
                        Better Auth user, and add any custom fields your app
                        needs:
                      </p>
                      <CodeBlock
                        language="typescript"
                        filename="convex/schema.ts"
                        code={stripIndent`
                          const schema = defineSchema({
                            users: defineTable({
                              authId: v.string(), // Reference to Better Auth user ID
                              // Your custom fields
                              role: v.string(),
                              preferences: v.object({
                                theme: v.string(),
                                notifications: v.boolean()
                              })
                            }).index("authId", ["authId"]) // Important: index for efficient queries
                          })`}
                      />
                    </div>

                    <div>
                      <p className="mb-4 text-muted-foreground">
                        Create mutations for your event hooks. These will run
                        whenever Better Auth creates or deletes a user, keeping
                        your app's user table in sync:
                      </p>
                      <CodeBlock
                        language="typescript"
                        filename="convex/userHooks.ts"
                        code={stripIndent`
                          import { userValidator } from '@erquhart/convex-better-auth'
                          import { internalMutation } from './_generated/server'

                          export const onCreateUser = internalMutation({
                            args: { user: userValidator },
                            handler: async (ctx, { user }) => {
                              // Create your app's user record
                              await ctx.db.insert("users", {
                                authId: user._id,
                                role: "user",
                                preferences: {
                                  theme: "light",
                                  notifications: true
                                }
                              })
                            }
                          })

                          export const onDeleteUser = internalMutation({
                            args: { id: v.string() },
                            handler: async (ctx, { id }) => {
                              const user = await ctx.db
                                .query("users")
                                .withIndex("authId", q => q.eq("authId", id))
                                .unique()
                              
                              if (user) {
                                await ctx.db.delete(user._id)
                              }
                            }
                          })`}
                      />
                    </div>

                    <div>
                      <p className="mb-4 text-muted-foreground">
                        Finally, update your Better Auth configuration to use
                        these hooks:
                      </p>
                      <CodeBlock
                        language="typescript"
                        filename="convex/auth.ts"
                        code={stripIndent`
                          import { BetterAuth } from '@erquhart/convex-better-auth'
                          import { components, internal } from './_generated/api'

                          export const betterAuth: BetterAuth = new BetterAuth(
                            components.betterAuth,
                            // Better Auth options (e.g., social providers)
                            {
                              socialProviders: {
                                github: {
                                  clientId: process.env.GITHUB_CLIENT_ID as string,
                                  clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
                                },
                              },
                            },
                            // Event hooks configuration
                            {
                              onCreateUser: internal.userHooks.onCreateUser,
                              onDeleteUser: internal.userHooks.onDeleteUser,
                            }
                          )`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3
                    id="migrating-existing-users"
                    className="text-2xl font-bold mb-6"
                  >
                    <SectionLink href="#migrating-existing-users">
                      Migrating Existing Users
                    </SectionLink>
                  </h3>
                  <p className="text-lg mb-8">
                    If you're migrating from an existing authentication system,
                    you can use a gradual migration approach that moves users
                    over as they log in. This method is less disruptive than a
                    bulk migration and allows you to handle edge cases more
                    gracefully.
                  </p>

                  <div className="flex gap-3 rounded-md border bg-destructive/10 p-4 mb-12">
                    <div className="select-none text-destructive">⚠️</div>
                    <div className="text-sm text-destructive">
                      <p className="font-medium mb-2">Security Warning</p>
                      <p className="mb-2">
                        It is <strong>strongly recommended</strong> to verify
                        the user's email before executing any migration logic.
                        Without verification, account takeovers can occur
                        easily.
                      </p>
                      <p>
                        For systems with additional security measures like 2FA,
                        consider requiring users to authenticate through your
                        legacy system first. Future versions of these docs will
                        include more sophisticated migration strategies for such
                        cases.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div>
                      <p className="text-muted-foreground">
                        First, ensure Better Auth is configured to handle email
                        verification. For email/password auth, follow the{" "}
                        <a
                          href="https://www.better-auth.com/docs/concepts/email#email-verification"
                          className="text-primary underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          email verification setup guide
                        </a>
                        . For social login providers, email verification status
                        is automatically provided by the OAuth service via the
                        user emailVerified field, which is covered below.
                      </p>
                    </div>

                    <div>
                      <p className="mb-4 text-muted-foreground">
                        Update any schemas that use <code>v.id()</code> for user
                        IDs to use <code>v.string()</code> instead, as Better
                        Auth user IDs are strings and won't validate against{" "}
                        <code>v.id()</code>:
                      </p>
                      <CodeBlock
                        language="typescript"
                        filename="convex/schema.ts"
                        code={stripIndent`
                          const schema = defineSchema({
                            posts: defineTable({
                              // Before
                              // authorId: v.id("users"),
                              
                              // After
                              authorId: v.string(),
                              title: v.string(),
                              content: v.string(),
                            })
                          })`}
                      />
                    </div>

                    <div>
                      <p className="mb-4 text-muted-foreground">
                        Add a field to track migrated users. This can be done by
                        adding an <code>isMigrated</code> field to your legacy
                        users table, or by creating a separate tracking table:
                      </p>
                      <CodeBlock
                        language="typescript"
                        filename="convex/schema.ts"
                        code={stripIndent`
                          const schema = defineSchema({
                            // Option 1: Add to existing users table
                            legacyUsers: defineTable({
                              // ... existing fields ...
                              isMigrated: v.boolean(),
                            }),

                            // Option 2: Create a separate tracking table
                            migratedUsers: defineTable({
                              legacyUserId: v.string(),
                              betterAuthId: v.string(),
                            }).index("legacyUserId", ["legacyUserId"]),
                          })`}
                      />
                    </div>

                    <div>
                      <p className="mb-4 text-muted-foreground">
                        Implement the migration logic in your{" "}
                        <code>onCreateSession</code> hook. This will run each
                        time a user logs in, allowing you to gradually migrate
                        users as they access your app. Be sure to verify the
                        user's email status before proceeding with migration:
                      </p>
                      <CodeBlock
                        language="typescript"
                        filename="convex/userHooks.ts"
                        code={stripIndent`
                          import { sessionValidator } from '@erquhart/convex-better-auth'
                          import { asyncMap } from 'convex-helpers'
                          import { internalMutation } from './_generated/server'

                          export const onCreateSession = internalMutation({
                            args: { session: sessionValidator },
                            handler: async (ctx, { session }) => {
                              // Check if user is already migrated
                              const migrated = await ctx.db
                                .query("migratedUsers")
                                .withIndex("legacyUserId", q => 
                                  q.eq("legacyUserId", session.userId)
                                )
                                .unique()
                              
                              if (migrated) {
                                return // User already migrated
                              }

                              // Get full user object to check email verification
                              const user = await betterAuth.getAnyUserById(ctx, session.userId)
                              if (!user?.emailVerified) {
                                return // Wait for email verification
                              }

                              // Find legacy user data
                              const legacyUser = await ctx.db
                                .query("legacyUsers")
                                .withIndex("email", q => q.eq(q.field("email"), session.email))
                                .unique()
                              
                              if (!legacyUser) {
                                return // No legacy user to migrate
                              }

                              // Update references in other tables
                              const userPosts = await ctx.db
                                .query("posts")
                                .withIndex("authorId", q => q.eq(q.field("authorId"), legacyUser._id))
                                .collect()
                              
                              await asyncMap(userPosts, async post => {
                                await ctx.db.patch(post._id, {
                                  authorId: session.userId
                                })
                              })

                              // Track the migration
                              await ctx.db.insert("migratedUsers", {
                                legacyUserId: legacyUser._id,
                                betterAuthId: session.userId
                              })
                            }
                          })`}
                      />
                    </div>

                    <div>
                      <p className="mb-4 text-muted-foreground">
                        Finally, update your Better Auth configuration to use
                        the migration hook:
                      </p>
                      <CodeBlock
                        language="typescript"
                        filename="convex/auth.ts"
                        code={stripIndent`
                          export const betterAuth: BetterAuth = new BetterAuth(
                            components.betterAuth,
                            { ...options },
                            {
                              onCreateSession: internal.userHooks.onCreateSession,
                              // ... other hooks
                            }
                          )`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="api-reference" className="py-16">
          <h2 className="text-3xl font-bold mb-8">
            <SectionLink href="#api-reference">API Reference</SectionLink>
          </h2>

          <div className="space-y-12">
            <div id="authentication-methods">
              <h3 className="text-2xl font-bold mb-6">
                <SectionLink href="#authentication-methods">
                  Auth Instance Methods
                </SectionLink>
              </h3>
              <p className="mb-4 text-muted-foreground">
                These methods are available on your Better Auth instance to help
                manage authentication state.
              </p>
              <CodeBlock
                language="typescript"
                filename="convex/someFile.ts"
                highlightedLines={[6, 7, 9, 10, 12, 13]}
                code={stripIndent`
                  import { betterAuth } from './auth'

                  export const myQuery = query({
                    args: {},
                    handler: async (ctx) => {
                      // Get the currently authenticated user's ID
                      const userId = await betterAuth.getAuthUserId(ctx)

                      // Get the currently authenticated user
                      const user = await betterAuth.getAuthUser(ctx)

                      // Get any user by ID - typically for admin functionality
                      const user = await betterAuth.getAnyUserById(ctx, id)

                      // You can also use the standard Convex ctx.auth method
                      const identity = await ctx.auth.getUserIdentity()
                    }
                  })
                `}
              />
            </div>

            <div id="event-hooks">
              <h3 className="text-2xl font-bold mb-6">
                <SectionLink href="#event-hooks">Event Hooks</SectionLink>
              </h3>
              <p className="mb-12 text-muted-foreground">
                The component provides hooks for important authentication
                events. These can be configured when creating your Better Auth
                instance, and are completely optional.
              </p>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-semibold mb-2">
                    Define Your Hooks
                  </h4>
                  <p className="mb-4 text-muted-foreground">
                    First, define your event handlers as internal mutations:
                  </p>
                  <CodeBlock
                    language="typescript"
                    filename="convex/myHooks.ts"
                    code={stripIndent`
                      import { userValidator, sessionValidator } from '@erquhart/convex-better-auth'
                      import { internalMutation } from './_generated/server'

                      export const onCreateUser = internalMutation({
                        args: { user: userValidator },
                        handler: async (ctx, { user }) => {
                          // Handle user creation
                          // e.g., create additional user data in your app's tables
                        }
                      })

                      export const onDeleteUser = internalMutation({
                        args: { id: v.string() },
                        handler: async (ctx, { id }) => {
                          // Handle user deletion
                          // e.g., clean up related user data
                        }
                      })

                      export const onCreateSession = internalMutation({
                        args: { session: sessionValidator },
                        handler: async (ctx, { session }) => {
                          // Handle session creation
                          // e.g., log session activity
                        }
                      })`}
                  />
                </div>

                <div>
                  <h4 className="mt-10 text-xl font-semibold mb-2">
                    Add hooks to component configuration
                  </h4>
                  <p className="mb-4 text-muted-foreground">
                    Configure the hooks when creating your Better Auth instance
                    via function references.
                  </p>
                  <CodeBlock
                    language="typescript"
                    filename="convex/auth.ts"
                    code={stripIndent`
                      export const betterAuth: BetterAuth = new BetterAuth(
                        components.betterAuth,
                        { ...options }

                        // Event hooks configuration
                        {
                          onCreateUser: internal.myHooks.onCreateUser,
                          onDeleteUser: internal.myHooks.onDeleteUser,
                          onCreateSession: internal.myHooks.onCreateSession,
                        }
                      )`}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
