import * as fs from "node:fs";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Link as LinkIcon } from "lucide-react";
import DocsLayout, { SmoothScrollLink } from "@/components/docs-layout";
import { CodeBlock } from "@/components/code-block";
import { stripIndent } from "common-tags";
import { AlertTriangle, Info } from "lucide-react";

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
      <div className="max-w-3xl mx-auto">
        <div className="py-20 space-y-10">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-[rgb(243,176,28)] from-30% to-[#FF3366] to-100% bg-clip-text text-transparent">
              Convex
            </h1>
            <span className="text-4xl font-light text-muted-foreground">+</span>
            <h1 className="text-5xl font-bold tracking-tight">Better Auth</h1>
          </div>
          <div className="flex items-center gap-2 mb-8">
            <code className="px-2 py-1 text-sm rounded-md bg-muted">
              v0.1.0
            </code>
            <span className="px-2 py-1 text-xs rounded-full font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
              Alpha
            </span>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Own your auth in your Convex applications. Type-safe, secure
            authentication and a beautiful developer experience with Better
            Auth. Built for modern TypeScript applications with real-time data
            sync.
          </p>
          <div className="flex gap-6 pt-2">
            <a
              href="#getting-started"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Get Started
            </a>
            <a
              href="https://github.com/example/convex-better-auth"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>

        <section id="alpha-status" className="py-10">
          <div className="p-6 rounded-md border-2 border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-amber-500/10 space-y-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500/80 flex-shrink-0" />
              <h2 className="text-2xl font-bold text-yellow-700/90 dark:text-yellow-400/90">
                Alpha Status
              </h2>
            </div>

            <p className="text-muted-foreground">
              Better Auth is currently in early alpha development. While
              functional, there are several important considerations to keep in
              mind:
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">API Stability:</span> APIs may
                    change without notice. Breaking changes could be introduced
                    between minor versions during the alpha phase.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Performance:</span>{" "}
                    Optimizations are ongoing. Current implementations may not
                    be suitable for high-traffic production environments.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Browser Support:</span>{" "}
                    Currently only tested on the latest versions of Chrome,
                    Firefox, and Safari. Compatibility with older browsers is
                    not guaranteed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-blue-500/70 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Feedback:</span> We actively
                    encourage feedback and bug reports. Please submit issues on{" "}
                    <a
                      href="https://github.com/erquhart/convex-better-auth/issues"
                      className="text-primary/80 hover:text-primary hover:underline"
                    >
                      GitHub
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-2 border-t border-yellow-500/20">
              <h4 className="text-sm font-medium mb-3 text-yellow-700/80 dark:text-yellow-400/80">
                Known Limitations
              </h4>
              <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                <li>
                  Some authentication providers may have limited functionality
                </li>
                <li>Session management features are still being developed</li>
                <li>React Server Components integration is experimental</li>
                <li>
                  TypeScript type inference may be incomplete in some edge cases
                </li>
                <li>Node.js support is limited to version 16.0.0 and above</li>
              </ul>
            </div>

            <div className="pt-5 mt-2 border-t border-yellow-500/20">
              <h4 className="text-sm font-medium mb-3 text-yellow-700/80 dark:text-yellow-400/80">
                Production Usage
              </h4>
              <p className="text-sm text-muted-foreground">
                While we don't recommend using Better Auth in critical
                production systems yet, early adopters are using it successfully
                in non-critical applications. If you decide to use it in
                production, we recommend pinning to exact versions and
                thoroughly testing your implementation.
              </p>
            </div>
          </div>
        </section>

        <section id="getting-started" className="py-10">
          <h2 className="text-3xl font-bold mb-6">
            <SectionLink href="#getting-started">Getting Started</SectionLink>
          </h2>
          <p className="mb-6 text-lg">
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

          <h2 id="installation" className="text-2xl font-bold mt-10 mb-4">
            <SectionLink href="#installation">Installation</SectionLink>
          </h2>
          <p className="mb-6">
            To get started, install the component and a pinned version of Better
            Auth.
          </p>

          <CodeBlock
            language="bash"
            code="npm install @erquhart/convex-better-auth better-auth@1.2.5"
          />

          <p className="mb-6 mt-10">Add the component to your application.</p>

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

          <h3 id="setup-better-auth" className="text-2xl font-bold mt-10 mb-4">
            <SectionLink href="#setup-better-auth">
              Set up Better Auth
            </SectionLink>
          </h3>
          <p className="mb-4">Create a Better Auth instance in your backend.</p>
          <div className="mb-6 flex gap-3 rounded-md border bg-muted/50 p-4">
            <div className="select-none text-primary">💡</div>
            <p className="text-sm text-muted-foreground">
              Keeping the Better Auth instance in a separate file like{" "}
              convex/auth.ts is recommended for better organization, but it will
              work from any file in the Convex directory.
            </p>
          </div>

          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            code={stripIndent`
              import { BetterAuth } from '@erquhart/convex-better-auth'
              import type { BetterAuthOptions } from 'better-auth'
              import { components, internal } from './_generated/api'

              export const betterAuth: BetterAuth<BetterAuthOptions> = new BetterAuth(
                components.betterAuth,
                // Add your options here
                { ... }
              )
            `}
          />

          <p className="mb-4">Register route handlers.</p>

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
          <h3 id="setup-client" className="text-2xl font-bold mt-10 mb-4">
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

          <p className="mb-4">Add to Convex client.</p>
          <p className="mb-4">
            Use `ConvexProviderWithAuth` instead of `ConvexProvider`. The
            specific file this happens in will depend on your framework.
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

          <h3 className="text-2xl font-bold mt-10 mb-4">Basic Usage</h3>
          <p className="mb-6">Import the functions you need from Quantum.js:</p>

          <CodeBlock
            language="typescript"
            filename="app/auth.ts"
            code={`import { map, filter, pipe } from 'quantum-js';

// Use the pipe function to compose operations
const processData = pipe(
  filter((x: number) => x > 5),
  map((x: number) => x * 2)
);

const result = processData([1, 6, 3, 8, 10]);
// result: [12, 16, 20]`}
          />
        </section>

        <section id="core-concepts" className="py-10">
          <h2 className="text-3xl font-bold mb-6">Core Concepts</h2>
          <p className="mb-6">
            Quantum.js is built around a few core concepts that make it powerful
            and flexible:
          </p>

          <h3 className="text-2xl font-bold mt-8 mb-4">Immutability</h3>
          <p className="mb-6">
            All operations in Quantum.js are immutable, meaning they don't
            modify the original data. This makes your code more predictable and
            easier to reason about.
          </p>

          <CodeBlock
            language="typescript"
            filename="app/example.ts"
            code={`import { update } from 'quantum-js';

const user = { name: 'John', age: 30 };
const updatedUser = update(user, { age: 31 });

// user: { name: 'John', age: 30 }
// updatedUser: { name: 'John', age: 31 }`}
          />

          <h3 className="text-2xl font-bold mt-8 mb-4">Function Composition</h3>
          <p className="mb-6">
            Compose multiple functions together to create reusable data
            transformation pipelines.
          </p>

          <CodeBlock
            language="typescript"
            filename="app/users.ts"
            code={`import { pipe, map, filter, sort } from 'quantum-js';

const processUsers = pipe(
  filter((user: User) => user.active),
  sort((a: User, b: User) => a.name.localeCompare(b.name)),
  map((user: User) => ({ 
    displayName: \`\${user.name} (\${user.age})\`, 
    id: user.id 
  }))
);

const processedUsers = processUsers(users);`}
          />
        </section>

        <section id="api-reference" className="py-10">
          <h2 className="text-3xl font-bold mb-10">API Reference</h2>

          <div className="space-y-16">
            <section id="react-hooks">
              <h3 className="text-2xl font-bold mb-6">React Hooks</h3>

              <div className="space-y-12">
                <div id="use-quantum">
                  <h4 className="text-xl font-semibold mb-2">useQuantum</h4>
                  <p className="mb-4 text-muted-foreground">
                    A React hook for managing state with Quantum.js utilities.
                  </p>
                  <CodeBlock
                    language="typescript"
                    filename="app/components/Counter.tsx"
                    code={`import { useQuantum } from 'quantum-js/react';

function Counter() {
  const [count, setCount] = useQuantum(0);
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`}
                  />
                </div>

                <div id="use-async-data">
                  <h4 className="text-xl font-semibold mb-2">useAsyncData</h4>
                  <p className="mb-4 text-muted-foreground">
                    A hook for handling async data fetching with loading and
                    error states.
                  </p>
                  <CodeBlock
                    language="typescript"
                    filename="app/components/UserProfile.tsx"
                    code={`import { useAsyncData } from 'quantum-js/react';

function UserProfile({ userId }) {
  const { data, loading, error } = useAsyncData(
    () => fetchUser(userId),
    [userId]
  );
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Hello, {data.name}!</div>;
}`}
                  />
                </div>
              </div>
            </section>

            <section id="nodejs-utilities">
              <h3 className="text-2xl font-bold mb-6">Node.js Utilities</h3>

              <div className="space-y-12">
                <div id="create-server">
                  <h4 className="text-xl font-semibold mb-2">createServer</h4>
                  <p className="mb-4 text-muted-foreground">
                    Create a lightweight HTTP server with middleware support.
                  </p>
                  <CodeBlock
                    language="typescript"
                    filename="server/index.ts"
                    code={`import { createServer } from 'quantum-js/node';

const app = createServer();

app.use(logger());
app.use(cors());

app.get('/api/users', async (req, res) => {
  const users = await db.getUsers();
  res.json(users);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`}
                  />
                </div>

                <div id="file-system">
                  <h4 className="text-xl font-semibold mb-2">fileSystem</h4>
                  <p className="mb-4 text-muted-foreground">
                    Promise-based file system utilities.
                  </p>
                  <CodeBlock
                    language="typescript"
                    filename="server/files.ts"
                    code={`import { fileSystem } from 'quantum-js/node';

async function processFiles() {
  const files = await fileSystem.readDir('./data');
  
  for (const file of files) {
    const content = await fileSystem.readFile(
      \`./data/\${file}\`, 
      'utf-8'
    );
    
    const processed = processContent(content);
    
    await fileSystem.writeFile(
      \`./output/\${file}\`, 
      processed
    );
  }
}`}
                  />
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
