/// <reference types="vite/client" />

import { describe } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../component/_generated/api.js";
import schema from "../component/testProfiles/schema.profile-plugin-table.js";

describe("Better Auth Adapter Tests", async () => {
  const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
  await t.action(api.adapterTest.runTests, {});
});
