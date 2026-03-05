/// <reference types="vite/client" />

import { describe } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../component/_generated/api.js";
import schema from "../component/schema.js";
import { createClient } from "./create-client.js";
import type { DataModel } from "../component/_generated/dataModel.js";
import type { BetterAuthOptions, DBAdapter } from "better-auth/types";
import type { GenericCtx } from "./index.js";

type AdapterGetter = (
  opts?: Omit<BetterAuthOptions, "database">
) => Promise<DBAdapter>;

export const getAdapter: (ctx: GenericCtx<DataModel>) => AdapterGetter =
  (ctx: GenericCtx<DataModel>) =>
  async (opts?: Omit<BetterAuthOptions, "database">) => {
    const authComponent = createClient<DataModel>(api as any, {
      verbose: false,
    });
    const adapterFactory = authComponent.adapter(ctx);
    return adapterFactory(opts ?? {});
  };

// runAdapterTest was removed in better-auth 1.5 — upstream adapter tests are
// not available. Custom adapter tests remain.

describe("Convex Adapter Tests", async () => {
  const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
  await t.action(api.adapterTest.runCustomTests);
});
