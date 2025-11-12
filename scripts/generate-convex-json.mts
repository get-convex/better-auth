import { writeFile, copyFile, rm } from "node:fs/promises";
import { resolve } from "node:path";

const example = process.argv[2];

if (!example) {
  throw new Error("no example directory provided");
}
const exampleDir = `examples/${example}`;

// Generate convex.json in root
const convexJson = {
  $schema: "./node_modules/convex/schemas/convex.schema.json",
  codegen: {
    legacyComponentApi: false,
  },
  functions: `${exampleDir}/convex`,
};

await writeFile(
  resolve(process.cwd(), "convex.json"),
  JSON.stringify(convexJson, null, 2)
);

// Delete root .env.local file if it exists - this allows for configuration of a
// new project if the example doesn't have a .env.local file.
try {
  await rm(resolve(process.cwd(), ".env.local"));
} catch {
  console.log("no root .env.local file found");
}

// Copy example .env.local file to root if it exists
try {
  const envLocalPath = resolve(process.cwd(), exampleDir, ".env.local");
  await copyFile(envLocalPath, resolve(process.cwd(), ".env.local"));
} catch {
  console.log("no example .env.local file found");
}
