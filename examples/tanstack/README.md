## Convex + Better Auth + TanStack Start

This example shows how to use Better Auth with Convex and TanStack Start.

Note that dependencies are set up to work with the local component in this repo,
it is not set up for standalone use (but can be adapted).

### Running the example

1. Clone or fork the repo
2. Install root dependencies

```bash
npm install
```

3. In a separate terminal, install example dependencies

```bash
cd examples/tanstack
npm install
```

4. Initialize the database

```bash
npx convex dev --once
```

5. Run the example

```bash
npm run dev
```

6. Back in the first terminal, run the component build watch task (keep this running)

```bash
npm run build:watch
```
