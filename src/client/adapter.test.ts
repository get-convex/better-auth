/// <reference types="vite/client" />

import { describe, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../component/_generated/api.js";
import schema from "../component/testProfiles/schema.profile-plugin-table.js";

const MIN_NODE_MAJOR = 24;
const currentNodeMajor = Number.parseInt(
  process.versions.node.split(".")[0] ?? "0",
  10
);

if (currentNodeMajor < MIN_NODE_MAJOR) {
  describe("Better Auth Adapter Tests", () => {
    it.skip(
      `requires Node ${MIN_NODE_MAJOR}+ (adapter test-utils uses explicit resource management syntax)`,
      () => {}
    );
  });
} else {
  describe("Better Auth Adapter Tests", async () => {
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
    await t.action(api.adapterTest.runTests, {});
  });
}
