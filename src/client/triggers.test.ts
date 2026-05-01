/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { createFunctionHandle } from "convex/server";
import schema from "../component/schema.js";
import { api, internal } from "../component/_generated/api.js";

const baseSessionData = () => ({
  expiresAt: Date.now() + 60_000,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  userId: "user-1",
  userAgent: "original",
});

describe("trigger result propagation (issue #291)", () => {
  it("api.adapter.create returns the doc reflecting onCreateHandle writes", async () => {
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
    const result = await t.run(async (ctx) => {
      const handle = await createFunctionHandle(
        internal.testProfiles.triggerHandlers.sessionOnCreateUpdater
      );
      return await ctx.runMutation(api.adapter.create, {
        input: {
          model: "session",
          data: { ...baseSessionData(), token: "create-token-1" },
        },
        onCreateHandle: handle,
      });
    });
    expect(result.userAgent).toBe("trigger-ran-on-create");
  });

  it("api.adapter.updateOne returns the doc reflecting onUpdateHandle writes", async () => {
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
    const result = await t.run(async (ctx) => {
      await ctx.runMutation(api.adapter.create, {
        input: {
          model: "session",
          data: { ...baseSessionData(), token: "update-token-1" },
        },
      });
      const handle = await createFunctionHandle(
        internal.testProfiles.triggerHandlers.sessionOnUpdateUpdater
      );
      return await ctx.runMutation(api.adapter.updateOne, {
        input: {
          model: "session",
          update: { userAgent: "set-by-update" },
          where: [{ field: "token", operator: "eq", value: "update-token-1" }],
        },
        onUpdateHandle: handle,
      });
    });
    expect(result.userAgent).toBe("trigger-ran-on-update");
  });
});
