"use client";

import { Link as LinkIcon } from "lucide-react";
import { CodeBlock as CodeBlockComponent } from "./code-block";
import { stripIndent } from "common-tags";
import { AlertTriangle } from "lucide-react";
import { ComponentProps, PropsWithChildren } from "react";
import { cx } from "class-variance-authority";
import { GenerateSecret } from "./generate-secret";
import { cn } from "@/lib/utils";

const CodeBlock = (props: ComponentProps<typeof CodeBlockComponent>) => (
  <CodeBlockComponent className={cx(props.className, "mb-6")} {...props} />
);

const SectionLink = ({
  href,
  children,
}: PropsWithChildren<{
  href: string;
  children: React.ReactNode;
}>) => (
  <a
    href={href}
    className="inline-flex items-center rounded-md -ml-2 px-2 py-1 cursor-pointer hover:bg-muted/50 transition-colors group"
  >
    {children}
    <LinkIcon className="ml-2 size-4 opacity-0 group-hover:opacity-50 transition-opacity" />
  </a>
);

const Section = ({
  id,
  title,
  className,
  children,
}: PropsWithChildren<{
  id: string;
  title: string;
  className?: string;
}>) => (
  <div id={id} className={cx(className, "pt-8 mb-12")}>
    <h2 className="text-3xl font-bold mb-4">
      <SectionLink href={`#${id}`}>{title}</SectionLink>
    </h2>
    <div className="mt-6">{children}</div>
  </div>
);

const Subsection = ({
  id,
  title,
  className,
  children,
}: PropsWithChildren<{
  id: string;
  title: string;
  className?: string;
}>) => (
  <div id={id} className={cx(className, "pt-4 mb-12")}>
    <h3 className="text-xl font-semibold mb-4">
      <SectionLink href={`#${id}`}>{title}</SectionLink>
    </h3>
    {children}
  </div>
);

const P = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => (
  <p className={cx(className, "font-light mb-6 leading-relaxed")}>{children}</p>
);

const Ul = ({ children }: PropsWithChildren) => (
  <ul className="list-disc font-light mb-6 leading-relaxed ml-4">{children}</ul>
);

const Li = ({ children }: PropsWithChildren) => (
  <li className="mb-2">{children}</li>
);

const ContentHeading = ({
  className,
  id,
  title,
}: {
  className?: string;
  id: string;
  title: string;
}) => (
  <h4 id={id} className={cx(className, "font-semibold pt-2 mb-4")}>
    <SectionLink href={`#${id}`}>{title}</SectionLink>
  </h4>
);

const Code = ({ children }: { children: React.ReactNode }) => {
  return (
    <code className="px-1 py-0.75 rounded bg-muted font-light font-mono text-sm">
      {children}
    </code>
  );
};

const Callout = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={cx(
      className,
      "mb-8 flex gap-3 rounded-md border bg-muted/50 p-4"
    )}
  >
    <div className="select-none text-primary">💡</div>
    <p className="text-sm text-muted-foreground">{children}</p>
  </div>
);

export default function Home() {
  return (
    <div
      ref={(el) => {
        console.log("test ref", el);
      }}
      className="max-w-3xl mx-auto px-4 sm:px-6 md:mt-12"
    >
      <div className="py-8 sm:py-20 space-y-6 sm:space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
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
          Comprehensive, secure authentication with Better Auth for Convex.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-2">
          <a
            href="#getting-started"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Get Started
          </a>
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

      <section id="alpha-status" className="mb-12">
        <div className="p-6 rounded-lg border bg-muted/50 space-y-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
            <h2 className="text-2xl font-bold text-yellow-500">Alpha Status</h2>
          </div>

          <p className="text-muted-foreground">
            The Convex Better Auth component is in early alpha development.
          </p>

          <p className="text-muted-foreground">
            If your use case isn&apos;t supported, a plugin doesn&apos;t work,
            you hit a bug, etc, please open a{" "}
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
      </section>

      <Section id="what-is-this" title="What is this?">
        <P>
          This library is a{" "}
          <a href="https://www.convex.dev/components" className="underline">
            Convex Component
          </a>{" "}
          that provides an integration layer for using{" "}
          <a href="https://www.better-auth.com" className="underline">
            Better Auth
          </a>{" "}
          with{" "}
          <a href="https://www.convex.dev" className="underline">
            Convex
          </a>
          .
        </P>
        <P>
          After following the installation and setup steps below, you can use
          Better Auth in the normal way. Some exceptions will apply for certain
          configuration options, apis, and plugins.
        </P>
        <P>
          Check out the{" "}
          <a
            href="https://www.better-auth.com/docs/introduction"
            className="underline"
          >
            Better Auth docs
          </a>{" "}
          for usage information, plugins, and more.
        </P>
      </Section>

      <Section id="examples" title="Examples">
        <P>Check out complete working examples on GitHub.</P>
        <div className="grid sm:grid-cols-2 gap-4 mb-6sm:gap-6">
          <a
            href="https://github.com/erquhart/convex-better-auth/tree/main/examples/vite"
            className={cn(
              "flex w-full flex-col items-center rounded-xl border bg-card p-6 text-card-foreground shadow transition-colors hover:bg-muted/50 sm:p-10"
            )}
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              fill="currentColor"
            >
              <title>Vite</title>
              <path d="m8.286 10.578.512-8.657a.306.306 0 0 1 .247-.282L17.377.006a.306.306 0 0 1 .353.385l-1.558 5.403a.306.306 0 0 0 .352.385l2.388-.46a.306.306 0 0 1 .332.438l-6.79 13.55-.123.19a.294.294 0 0 1-.252.14c-.177 0-.35-.152-.305-.369l1.095-5.301a.306.306 0 0 0-.388-.355l-1.433.435a.306.306 0 0 1-.389-.354l.69-3.375a.306.306 0 0 0-.37-.36l-2.32.536a.306.306 0 0 1-.374-.316zm14.976-7.926L17.284 3.74l-.544 1.887 2.077-.4a.8.8 0 0 1 .84.369.8.8 0 0 1 .034.783L12.9 19.93l-.013.025-.015.023-.122.19a.801.801 0 0 1-.672.37.826.826 0 0 1-.634-.302.8.8 0 0 1-.16-.67l1.029-4.981-1.12.34a.81.81 0 0 1-.86-.262.802.802 0 0 1-.165-.67l.63-3.08-2.027.468a.808.808 0 0 1-.768-.233.81.81 0 0 1-.217-.6l.389-6.57-7.44-1.33a.612.612 0 0 0-.64.906L11.58 23.691a.612.612 0 0 0 1.066-.004l11.26-20.135a.612.612 0 0 0-.644-.9z" />
            </svg>
            <p className="font-medium mt-2">Vite</p>
          </a>
          <a
            href="https://github.com/erquhart/convex-better-auth/tree/main/examples/next"
            className={cn(
              "flex w-full flex-col items-center rounded-xl border bg-card p-6 text-card-foreground shadow transition-colors hover:bg-muted/50 sm:p-10"
            )}
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              fill="currentColor"
            >
              <title>Next.js</title>
              <path d="M11.5725 0c-.1763 0-.3098.0013-.3584.0067-.0516.0053-.2159.021-.3636.0328-3.4088.3073-6.6017 2.1463-8.624 4.9728C1.1004 6.584.3802 8.3666.1082 10.255c-.0962.659-.108.8537-.108 1.7474s.012 1.0884.108 1.7476c.652 4.506 3.8591 8.2919 8.2087 9.6945.7789.2511 1.6.4223 2.5337.5255.3636.04 1.9354.04 2.299 0 1.6117-.1783 2.9772-.577 4.3237-1.2643.2065-.1056.2464-.1337.2183-.1573-.0188-.0139-.8987-1.1938-1.9543-2.62l-1.919-2.592-2.4047-3.5583c-1.3231-1.9564-2.4117-3.556-2.4211-3.556-.0094-.0026-.0187 1.5787-.0235 3.509-.0067 3.3802-.0093 3.5162-.0516 3.596-.061.115-.108.1618-.2064.2134-.075.0374-.1408.0445-.495.0445h-.406l-.1078-.068a.4383.4383 0 01-.1572-.1712l-.0493-.1056.0053-4.703.0067-4.7054.0726-.0915c.0376-.0493.1174-.1125.1736-.143.0962-.047.1338-.0517.5396-.0517.4787 0 .5584.0187.6827.1547.0353.0377 1.3373 1.9987 2.895 4.3608a10760.433 10760.433 0 004.7344 7.1706l1.9002 2.8782.096-.0633c.8518-.5536 1.7525-1.3418 2.4657-2.1627 1.5179-1.7429 2.4963-3.868 2.8247-6.134.0961-.6591.1078-.854.1078-1.7475 0-.8937-.012-1.0884-.1078-1.7476-.6522-4.506-3.8592-8.2919-8.2087-9.6945-.7672-.2487-1.5836-.42-2.4985-.5232-.169-.0176-1.0835-.0366-1.6123-.037zm4.0685 7.217c.3473 0 .4082.0053.4857.047.1127.0562.204.1642.237.2767.0186.061.0234 1.3653.0186 4.3044l-.0067 4.2175-.7436-1.14-.7461-1.14v-3.066c0-1.982.0093-3.0963.0234-3.1502.0375-.1313.1196-.2346.2323-.2955.0961-.0494.1313-.054.4997-.054z" />
            </svg>
            <p className="font-medium mt-2">Next.js</p>
          </a>
        </div>
      </Section>

      <Section id="getting-started" title="Getting Started">
        <Subsection id="prerequisites" title="Prerequisites">
          <P>
            You&apos;ll first need a project on Convex where{" "}
            <Code>npx convex dev</Code> has been run on your local machine. If
            you don&apos;t have one, run <Code>npm create convex@latest</Code>{" "}
            to get started, and{" "}
            <a
              href="https://docs.convex.dev/getting-started/installation"
              className="underline"
            >
              check out the docs
            </a>{" "}
            to learn more.
          </P>
          <Callout>
            It&apos;s helpful to have the Convex dev server (
            <Code>npx convex dev</Code>) running in the background while setting
            up, otherwise you&apos;ll see type errors that won&apos;t resolve
            until you run it.
          </Callout>
        </Subsection>
        <Subsection id="installation" title="Installation">
          <P>
            To get started, install the component and a pinned version of Better
            Auth.
          </P>

          <CodeBlock
            variants={[
              {
                label: "npm",
                code: stripIndent`
                    npm install @erquhart/convex-better-auth
                    npm install better-auth@1.2.7 --save-exact
                  `,
                language: "shell",
              },
              {
                label: "pnpm",
                code: stripIndent`
                    pnpm add @erquhart/convex-better-auth
                    pnpm add better-auth@1.2.7 --save-exact
                  `,
                language: "shell",
              },
              {
                label: "yarn",
                code: stripIndent`
                    yarn add @erquhart/convex-better-auth
                    yarn add better-auth@1.2.7 --exact
                  `,
                language: "shell",
              },
              {
                label: "bun",
                code: stripIndent`
                    bun add @erquhart/convex-better-auth
                    bun add better-auth@1.2.7 --exact
                  `,
                language: "shell",
              },
            ]}
          />

          <P>
            Generate a secret for encryption and generating hashes. Use the
            command below if you have openssl installed, or use the button to
            generate a random value instead. Or generate your own however you
            like.
          </P>

          <GenerateSecret />

          <P>Add the component to your application.</P>

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

          <P>
            Add a <Code>convex/auth.config.ts</Code> file to configure Better
            Auth as an authentication provider:
          </P>

          <CodeBlock
            language="typescript"
            filename="convex/auth.config.ts"
            code={stripIndent`
                export default {
                  providers: [
                    {
                      // This should be your Convex site URL, which ends in .convex.site
                      domain: process.env.CONVEX_SITE_URL,

                      // Application ID has to be "convex"
                      applicationID: "convex",
                    },
                  ],
                }
              `}
          />
        </Subsection>

        <Subsection id="better-auth-instance" title="Initialize Better Auth">
          <Callout>
            The Better Auth component uses the Convex database adapter, which
            handles all things schema and migration related automatically.
          </Callout>

          <P>
            Initialize the Convex component by importing the component class and
            creating a new instance. The component class constructor requires
            the generated component API object to be passed in.
          </P>
          <P>
            Instead of creating a Better Auth instance, serverless environments
            like Convex functions require that you provide a function that
            returns the Better Auth instance so a context can be passed in.
          </P>
          <P>
            The <Code>createAuth</Code> function is used for setting up http
            actions and can be imported for use in your Convex functions.
          </P>

          <P>First, add a users table to your schema.</P>

          <CodeBlock
            language="typescript"
            filename="convex/schema.ts"
            highlightedLines={[4, 5, 6, 7]}
            code={stripIndent`
                import { defineSchema, defineTable } from "convex/server";

                export default defineSchema({
                  // Can be named whatever you like
                  users: defineTable({
                    // Fields are optional
                  }),
                });
              `}
          />

          <P>Create your Better Auth instance.</P>
          <P>
            <strong>Note:</strong> Some Typescript errors will show until you
            save the file.
          </P>

          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            code={stripIndent`
                import {
                  BetterAuth,
                  convexAdapter,
                  type AuthFunctions,
                } from "@erquhart/convex-better-auth";
                import { convex } from "@erquhart/convex-better-auth/plugins";
                import { betterAuth } from "better-auth";
                import { components, internal } from "./_generated/api";
                import type { GenericCtx } from "./_generated/server";
                import type { Id, DataModel } from "./_generated/dataModel";

                // Typesafe way to pass the functions below into the component
                const authFunctions: AuthFunctions = internal.auth;

                // Initialize the component
                export const betterAuthComponent = new BetterAuth(
                  components.betterAuth,
                  authFunctions,
                );

                export const createAuth = (ctx: GenericCtx) =>
                  // Configure your Better Auth instance here
                  betterAuth({
                    database: convexAdapter(ctx, betterAuthComponent),
                    plugins: [
                      // The Convex plugin is required
                      convex(),
                    ],
                  });

                // These are required named exports
                export const { createUser, updateUser, deleteUser, createSession } =
                  betterAuthComponent.createAuthFunctions<DataModel>({
                    // Must create a user and return the user id
                    onCreateUser: async (ctx, user) => {
                      const id = await ctx.db.insert("users", {});
                      return id;
                    },

                    // Delete the user when they are deleted from Better Auth
                    // You can also omit this and use Better Auth's
                    // auth.api.deleteUser() function to trigger user deletion
                    // from within your own user deletion logic.
                    onDeleteUser: async (ctx, userId) => {
                      await ctx.db.delete(userId as Id<"users">);
                    },
                  });

                `}
          />

          <P>
            Register route handlers. This creates http actions for the Better
            Auth client to fetch from.
          </P>

          <CodeBlock
            language="typescript"
            filename="convex/http.ts"
            highlightedLines={[2, 6]}
            code={stripIndent`
                import { httpRouter } from 'convex/server'
                import { betterAuthComponent, createAuth } from './auth'

                const http = httpRouter()

                betterAuthComponent.registerRoutes(http, createAuth)

                export default http
              `}
          />
        </Subsection>

        <Subsection id="better-auth-client" title="Set up client">
          <P>Create a Better Auth client instance.</P>
          <CodeBlock
            language="typescript"
            filename="lib/auth-client.ts"
            code={stripIndent`
                import { createAuthClient } from "better-auth/react";
                import { convexClient } from "@erquhart/convex-better-auth/client/plugins";

                export const authClient = createAuthClient({
                  plugins: [
                    convexClient(),
                  ],
                });
              `}
          />

          <P>
            Set up the Convex client using <Code>ConvexBetterAuthProvider</Code>{" "}
            instead of <Code>ConvexProvider</Code>, passing in your Better Auth
            client as a prop. Use it to wrap your app, which will look different
            depending on your framework.
          </P>

          <CodeBlock
            language="typescript"
            filename="src/ConvexClientProvider.tsx"
            code={stripIndent`
                "use client"

                import { ConvexReactClient } from "convex/react";
                import { ConvexBetterAuthProvider } from "@erquhart/convex-better-auth/react";
                import { authClient } from "../lib/auth-client";
                import { PropsWithChildren } from "react";

                const convex = new ConvexReactClient(process.env.CONVEX_URL as string);

                const ConvexProvider = ({ children }: PropsWithChildren) => (
                  <ConvexBetterAuthProvider client={convex} authClient={authClient}>
                    {children}
                  </ConvexBetterAuthProvider>
                );

                export default ConvexProvider;

              `}
          />
        </Subsection>

        <Subsection id="framework-integration" title="Framework integration">
          <ContentHeading id="framework-client-only" title="Client only" />
          <P>
            The cross domain plugin provided by the component allows you to use
            Better Auth directly with Convex, without a full stack framework.
            This is great for client apps (e.g., React/Vite), or for Next.js or
            other framework apps if you don&apos;t require server side
            authentication.
          </P>

          <P>
            Add your site/app url to <Code>trustedOrigins</Code> and add the
            cross domain plugin to your Better Auth instance.
          </P>
          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            highlightedLines={[2, 10, 11, 15]}
            code={stripIndent`
                import { convexAdapter } from "@erquhart/convex-better-auth";
                import { convex, crossDomain } from "@erquhart/convex-better-auth/plugins";
                import { betterAuth } from "better-auth";
                import type { GenericCtx } from "./_generated/server";

                export const createAuth = (ctx: GenericCtx) =>
                  betterAuth({
                    database: convexAdapter(ctx, betterAuthComponent),
                    plugins: [
                      convex(),
                      crossDomain({
                        // Replace with your site url
                        siteUrl: "http://localhost:3000",
                      }),
                    ],
                  });
                `}
          />

          <P>
            Set your Convex site url - the url for accessing http actions on
            your Convex endpoint - as <Code>baseURL</Code> and add the cross
            domain plugin to your Better Auth client instance.
          </P>

          <CodeBlock
            language="typescript"
            filename="lib/auth-client.ts"
            highlightedLines={[2, 5, 6, 9]}
            code={stripIndent`
                import { createAuthClient } from "better-auth/react";
                import { convexClient, crossDomainClient } from "@erquhart/convex-better-auth/client/plugins";

                export const authClient = createAuthClient({
                  // Replace with your Convex site url
                  baseURL: 'https://adjective-animal-123.convex.site',
                  plugins: [
                    convexClient(),
                    crossDomainClient(),
                  ],
                });
              `}
          />

          <ContentHeading id="framework-full-stack" title="Full stack" />
          <P>
            You can also proxy requests from a full stack framework server to
            your Convex backend.
          </P>

          <CodeBlock
            variants={[
              {
                label: "Next.js",
                language: "typescript",
                filename: "next.config.ts",
                code: stripIndent`
                    import type { NextConfig } from "next";

                    const nextConfig: NextConfig = {
                      async rewrites() {
                        return [
                          {
                            source: "/api/auth/:path*",
                            destination:
                              "https://adjective-animal-123.convex.site/api/auth/:path*",
                          },
                        ];
                      },
                    };

                    export default nextConfig;
                  `,
              },
            ]}
          />

          <P>
            Set your site/app url as the <Code>baseURL</Code> on your Better
            Auth server instance.
          </P>
          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            highlightedLines={[8]}
            code={stripIndent`
                import { convexAdapter } from "@erquhart/convex-better-auth";
                import { convex } from "@erquhart/convex-better-auth/plugins";
                import { betterAuth } from "better-auth";
                import type { GenericCtx } from "./_generated/server";

                export const createAuth = (ctx: GenericCtx) =>
                  betterAuth({
                    baseURL: "http://localhost:3000",
                    database: convexAdapter(ctx, betterAuthComponent),
                    plugins: [
                      convex(),
                    ],
                  });
                `}
          />
        </Subsection>

        <Subsection id="users-table" title="Users table">
          <P>
            The Better Auth component has it&apos;s own tables in it&apos;s own
            space in your Convex project, like all Convex components. This means
            the Better Auth user table is separate from your application tables.
          </P>
          <P>
            Because of this, the Better Auth component requires that you create
            your own users table for your application. This table can have
            whatever fields you like, while the component user table keeps basic
            info such as email, verification status, two factor, etc.
          </P>
          <ContentHeading id="user-creation" title="User creation" />
          <P>
            When Better Auth creates a user, it will first run an
            <Code>onCreateUser</Code> hook where you will create your user and
            return the id. Better Auth then creates it&apos;s own user record
            and sets a relation to the provided id.
          </P>
          <P>
            The id you return will be the canonical user id. It will be
            referenced in the session and in the jwt claims provided to Convex.
          </P>
          <P>
            <Code>onCreateUser</Code> is required for keeping your users table
            transactionally synced with the Better Auth user table. There are
            also optional <Code>onUpdateUser</Code> and{" "}
            <Code>onDeleteUser</Code> hooks. These hooks can also do whatever
            else you want for each event.
          </P>

          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            code={stripIndent`
                import { asyncMap } from "convex-helpers";
                import { betterAuthComponent } from "./auth";
                import { Id } from "./_generated/dataModel";

                export const { createUser, deleteUser, updateUser } =
                  betterAuthComponent.createAuthFunctions({

                    // Must create a user and return the user id
                    onCreateUser: async (ctx, user) => {
                      const userId = await ctx.db.insert("users", {
                        someField: "foo",
                      });

                      // The user id must be returned
                      return userId;
                    },

                    // Delete the user when they are deleted from Better Auth
                    // You can also omit this and use Better Auth's
                    // auth.api.deleteUser() function to trigger user deletion
                    // from within your own user deletion logic.
                    onDeleteUser: async (ctx, userId) => {
                      await ctx.db.delete(userId as Id<"users">);

                      // Optionally delete any related data
                    },
                  });
                `}
          />
          <ContentHeading
            id="indexing-on-metadata"
            title="Indexing on metadata"
          />
          <P>
            You may have a need for accessing user metadata in your own user
            table, such as indexing by email or some other metadata. You can
            copy user metadata to your own user table on creation, and use the{" "}
            optional <Code>onUpdateUser</Code> hook to update your user table
            when a user&apos;s metadata changes. Note that changes you make to
            the synced field will not be reflected in the Better Auth user
            table.
          </P>
          <P>
            The user hooks are run in the same transaction as Better Auth&apos;s
            user create/update/delete operations, so if your hook throws an
            error or fails to write, the entire operation is guaranteed to fail,
            ensuring the user tables stay synced.
          </P>

          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            code={stripIndent`
                // ...

                export const { createUser, deleteUser, updateUser } =
                  betterAuthComponent.createAuthFunctions({
                    onCreateUser: async (ctx, user) => {
                      // Copy the user's email to the application users table.
                      return await ctx.db.insert("users", {
                        email: user.email,
                      });
                    },

                    onUpdateUser: async (ctx, user) => {
                      // Keep the user's email synced
                      await ctx.db.patch(user.userId as Id<"users">, {
                        email: user.email,
                      });
                    },

                    // ...
                  });
                `}
          />
        </Subsection>
      </Section>

      <Section id="basic-usage" title="Basic Usage">
        <P>
          Follow the{" "}
          <a
            href="https://www.better-auth.com/docs/basic-usage"
            className="underline"
          >
            Better Auth documentation
          </a>{" "}
          for basic usage. The Convex component provides a compatibility layer
          so things generally work as expected.
        </P>

        <P>
          Some things that do work differently with this component are
          documented here.
        </P>

        <Subsection id="basic-usage-server-side" title="Server side">
          <P>
            Better Auth provides server side functionality via `auth.api`
            methods.
          </P>
          <P>
            In a Convex function, you can get a Better Auth instance by passing
            the context object to <Code>createAuth()</Code>. Some api methods
            require request headers, so the component provides a method for
            getting a headers object tied to the current session.
          </P>
          <Callout>
            <Code>auth.api</Code> read-only methods can be run in a query. Use a
            mutation for anything that updates Better Auth tables.
          </Callout>

          <CodeBlock
            language="typescript"
            filename="convex/example.ts"
            code={stripIndent`
                import { createAuth, betterAuthComponent } from "./auth";

                export const getCurrentUser = query({
                  args: {},
                  handler: async (ctx) => {
                    const auth = createAuth(ctx);
                    const headers = await betterAuthComponent.getHeaders(ctx);
                    const session = await auth.api.getSession({
                      headers,
                    });
                    if (!session) {
                      return null;
                    }
                    // Do something with the session
                  }
                });
              `}
          />
        </Subsection>
      </Section>

      <Section id="authorization" title="Authorization">
        <Subsection id="authorization-react" title="React">
          <P>
            To check authentication state in your React components, use the{" "}
            <Code>useConvexAuth</Code> hook from <Code>convex/react</Code>.
          </P>
          <CodeBlock
            language="tsx"
            filename="App.tsx"
            code={stripIndent`
                import { useConvexAuth } from "convex/react";

                export default function App() {
                  const { isAuthenticated, isLoading } = useConvexAuth();

                  if (isLoading) {
                    return <div>Loading...</div>;
                  }
                  if (isAuthenticated) {
                    return <Dashboard />;
                  }
                  return <SignIn />;
                }
              `}
          />
        </Subsection>

        <Subsection
          id="authorization-convex-functions"
          title="Convex Functions"
        >
          <P>
            For authorization and user checks inside Convex functions (queries,
            mutations, actions), use Convex&apos;s <Code>ctx.auth</Code> or the
            <Code>getAuthUserId()</Code>/<Code>getAuthUser()</Code> methods on
            the Better Auth Convex component:
          </P>
          <CodeBlock
            language="ts"
            filename="convex/example.ts"
            code={stripIndent`
                import { betterAuthComponent } from "./auth";
                import { Id } from "./_generated/dataModel";
                export const getCurrentUser = query({
                  args: {},
                  handler: async (ctx) => {
                    // You can get the user id directly from Convex via ctx.auth
                    const identity = await ctx.auth.getUserIdentity();
                    if (!identity) {
                      return null;
                    }
                    // For now the id type requires an assertion
                    const userIdFromCtx = identity.subject as Id<"users">;

                    // The component provides a convenience method to get the user id
                    const userId = await betterAuthComponent.getAuthUserId(ctx);
                    if (!userId) {
                      return null
                    }

                    const user = await ctx.db.get(userId as Id<"users">);


                    // Get user email and other metadata from the Better Auth component
                    const userMetadata = await betterAuthComponent.getAuthUser(ctx);

                    // You can combine them if you want
                    return { ...userMetadata, ...user };
                  }
                });
              `}
          />
        </Subsection>
      </Section>

      <Section id="guides" title="Guides">
        <Subsection
          id="migrating-existing-users"
          title="Migrating Existing Users"
        >
          <P>
            <strong className="font-bold">Note:</strong> This guide is for
            applications migrating users that are already in their Convex
            database, and does not cover email/password authentication due to
            differences in password hashing.
          </P>
          <P>
            If you&apos;re migrating from an existing authentication system, you
            can use a gradual migration approach that moves users over as they
            log in. This method is less disruptive than a bulk migration and
            allows you to handle edge cases more gracefully.
          </P>

          <P>
            Implement the migration logic in your <Code>onCreateUser</Code> hook
            in <Code>convex/auth.ts</Code>. This will run when Better Auth
            attempts to create a new user, allowing you to gradually migrate
            users as they access your app.
          </P>
          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            code={stripIndent`
                export const { createUser, deleteUser, updateUser, createSession } =
                  betterAuthComponent.createAuthFunctions({
                    onCreateUser: async (ctx, user) => {
                      const existingUser = await ctx.db
                        .query('users')
                        .withIndex('email', (q) => q.eq('email', user.email))
                        .unique()

                      if (existingUser && !user.emailVerified) {
                        // This would be due to a social login provider where the email is not
                        // verified.
                        throw new ConvexError('Email not verified')
                      }

                      if (existingUser) {
                        // Drop old auth system fields (if any)
                        await ctx.db.patch(existingUser._id as Id<'users'>, {
                          oldAuthField: undefined,
                          otherOldAuthField: undefined,
                          foo: 'bar',
                        })
                        return existingUser._id as Id<'users'>
                      }

                      // No existing user found, create a new one and return the id
                      return await ctx.db.insert('users', {
                        foo: 'bar',
                      })
                    },
                    // ...
                  })
              `}
          />
        </Subsection>
        <Subsection id="migrate-0-5-to-0-6" title="Migrate 0.5 &rarr; 0.6">
          <Ul>
            <Li>
              <Code>AuthFunctions</Code> are now passed to the{" "}
              <Code>BetterAuth</Code> component constructor via the{" "}
              <Code>config</Code>
              object.
            </Li>
            <Li>
              The <Code>crossDomain</Code> plugin now requires a{" "}
              <Code>siteUrl</Code> option.
            </Li>
            <Li>
              The <Code>siteUrl</Code> value will be added to{" "}
              <Code>trustedOrigins</Code> automatically.{" "}
              <Code>trustedOrigins</Code> can be removed if your site url was
              the only value.
            </Li>
          </Ul>
          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            removedLines={[3, 10, 14]}
            addedLines={[4, 5, 6, 15, 16, 17]}
            code={stripIndent`
                export const betterAuthComponent = new BetterAuth(
                  components.betterAuth,
                  authFunctions,
                  {
                    authFunctions: authFunctions,
                  }
                )
                export const createAuth = (ctx: GenericCtx) =>
                  betterAuth({
                    trustedOrigins: ["http://localhost:3000"],
                    database: convexAdapter(ctx, betterAuthComponent),
                    plugins: [
                      convex(),
                      crossDomain(),
                      crossDomain({
                        siteUrl: "http://localhost:3000",
                      }),
                    ],
                  });
              `}
          />
        </Subsection>
        <Subsection id="migrate-0-4-to-0-5" title="Migrate 0.4 &rarr; 0.5">
          <Ul>
            <Li>
              Plugins and client plugins exported by the Convex Better Auth
              component are now exported under <Code>/plugins</Code> and
              <Code>/client/plugins</Code> respectively.
            </Li>
            <Li>
              A new <Code>crossDomain</Code> plugin is available. It&apos;s
              functionality was previously baked into the <Code>convex</Code>{" "}
              plugin.
            </Li>
            <Li>
              Projects that were running v0.4.x will need to add the{" "}
              <Code>crossDomain</Code> plugin to their Better Auth client and
              server instances.
            </Li>
          </Ul>
          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            code={stripIndent`
                import { convex, crossDomain } from "@erquhart/convex-better-auth/plugins";
                import { betterAuth } from "better-auth";
                import { GenericCtx } from "./_generated/server";

                export const createAuth = (ctx: GenericCtx) =>
                  betterAuth({
                    // ...
                    plugins: [crossDomain(), convex()],
                  });
              `}
          />
          <CodeBlock
            language="typescript"
            filename="lib/auth-client.ts"
            code={stripIndent`
                import { createAuthClient } from "better-auth/react";
                import {
                  convexClient,
                  crossDomainClient,
                } from "@erquhart/convex-better-auth/client/plugins";

                export const authClient = createAuthClient({
                  // ...
                  plugins: [crossDomainClient(), convexClient()],
                });
              `}
          />
          <Ul>
            <Li>
              The <Code>betterAuthComponent.authApi</Code> method is now{" "}
              <Code>betterAuthComponent.createAuthFunctions</Code>.
            </Li>
            <Li>
              All four named exports returned from{" "}
              <Code>betterAuthComponent.createAuthFunctions</Code> are now
              required, even if you&apos;re only providing an{" "}
              <Code>onCreateUser</Code> hook.
            </Li>
            <Li>
              If you pass your <Code>DataModel</Code> to{" "}
              <Code>betterAuthComponent.createAuthFunctions</Code>, everything
              is now typed except for Ids, which still need to be asserted. Any
              other type assertions from before can be removed.
            </Li>
          </Ul>
          <CodeBlock
            language="typescript"
            filename="convex/users.ts"
            code={stripIndent`
                import { betterAuthComponent } from "./auth";
                import type { DataModel } from "./_generated/dataModel";

                export const { createUser, deleteUser, updateUser, createSession } =
                  betterAuthComponent.createAuthFunctions<DataModel>({
                    onCreateUser: async (ctx, user) => {
                      return await ctx.db.insert('users', {})
                    },
                  })
              `}
          />

          <Ul>
            <Li>
              The <Code>authFunctions</Code> object (formerly{" "}
              <Code>authApi</Code>) is now passed to the <Code>BetterAuth</Code>{" "}
              constructor, and is no longer passed to <Code>convexAdapter</Code>
              .
            </Li>
            <Li>
              <Code>authFunctions</Code> is now typed using the{" "}
              <Code>AuthFunctions</Code> type.
            </Li>
            <Li>
              <Code>convexAdapter</Code> now takes the{" "}
              <Code>betterAuthComponent</Code> instance instead of the{" "}
              <Code>components.betterAuth</Code> object.
            </Li>
          </Ul>
          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            code={stripIndent`
                import { BetterAuth, type AuthFunctions } from "@erquhart/convex-better-auth";
                import { convex, crossDomain } from "@erquhart/convex-better-auth/plugins";
                import { components, internal } from "./_generated/api";

                const authFunctions: AuthFunctions = internal.users;

                export const betterAuthComponent = new BetterAuth(
                  components.betterAuth,
                  authFunctions,
                );

                export const createAuth = (ctx: GenericCtx) =>
                  betterAuth({
                    database: convexAdapter(ctx, betterAuthComponent),
                    trustedOrigins: ["http://localhost:3000"],
                    plugins: [convex(), crossDomain()],
                  });
              `}
          />
        </Subsection>
      </Section>
    </div>
  );
}
