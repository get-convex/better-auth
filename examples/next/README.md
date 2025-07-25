## Convex + Better Auth + Next.js

This example shows how to use Better Auth with Convex and Next.js.

Note that dependencies are set up to work with the local component in this repo,
it is not set up for standalone use (but can be adapted).

### Running the example

1. Clone or fork the repo
2. Install root dependencies

```bash
npm install
```

3. Change to one of the example directories and install dependencies

```bash
cd examples/next
npm install
```

4. If you haven't run this example before, initialize the database

```bash
npx convex dev --once
```

5. Run the example

```bash
npm run dev
```

If you're making changes to the component, open a separate terminal
and run the build watch task

```bash
npm run build:watch
```
