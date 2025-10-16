### Running examples

**Note:** The examples are not starters - the dependencies are set up to work
locally within this repo. They can be adapted for standalone use, but are
intentionally not set up for it.

1. Clone or fork the repo
2. Install root dependencies

```bash
npm install
```

3. Change to one of the example directories and install dependencies

```bash
cd examples/<example-name>
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

<!-- END: Include on https://convex.dev/components -->
