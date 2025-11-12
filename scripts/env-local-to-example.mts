import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const example = process.argv[2];

if (!example) {
  throw new Error("no example directory provided");
}
const exampleDir = `examples/${example}`;

// Copy root .env.local file to example if it exists - this is helpful for
// maintaining .env.locals for each project on initial setup, and redundant
// otherwise.
try {
  const envLocalPath = resolve(process.cwd(), exampleDir, ".env.local");
  await copyFile(resolve(process.cwd(), ".env.local"), envLocalPath);
} catch {
  console.log("no root .env.local file found");
}
