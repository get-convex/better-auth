## Convex + Better Auth + TanStack Start

This example shows how to use Better Auth with Convex and TanStack Start.

Note that dependencies are set up to work with the local component in this repo,
it is not set up for standalone use (but can be adapted).

**Note:** Examples on the `main` branch may not match your version of the Better
Auth component. Use the `latest` branch for the latest stable release and the
`alpha` branch for the latest alpha release.

### Running the example

1. Clone or fork the repo
2. Install root dependencies

```bash
npm install
```

3. Change to one of the example directories and install dependencies

```bash
cd examples/tanstack
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
