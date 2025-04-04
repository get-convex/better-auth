import * as fs from "node:fs";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import DocsLayout from "@/components/docs-layout";
import { CodeBlock } from "@/components/code-block";
import { stripIndent } from "common-tags";
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

        <section id="getting-started" className="py-10">
          <h2 className="text-3xl font-bold mb-6">Getting Started</h2>
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
          <h3 className="text-2xl font-bold mt-10 mb-4">Installation</h3>
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

          <h3 className="text-2xl font-bold mt-10 mb-4">Set up Better Auth</h3>
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
                {
                  trustedOrigins: ['http://localhost:5173'],
                  socialProviders: {
                    github: {
                      clientId: process.env.AUTH_GITHUB_ID as string,
                      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
                    },
                  },
                },
                {
                  onCreateSession: internal.timer.migrateUser,
                },
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
                allowedOrigins: ['http://localhost:5173'],
              })

              export default http
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
