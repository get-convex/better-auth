#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8")
);

const srcPath = join(root, "src/version.ts");
writeFileSync(srcPath, `export const VERSION = "${version}";\n`);

const distPath = join(root, "dist/version.js");
if (existsSync(distPath)) {
  const existing = readFileSync(distPath, "utf8");
  const mapMatch = existing.match(/\n\/\/# sourceMappingURL=.*$/);
  const tail = mapMatch ? mapMatch[0] : "";
  writeFileSync(distPath, `export const VERSION = "${version}";${tail}\n`);
}
