// Stub trigger handles for tests that need a real FunctionReference to pass
// as onCreateHandle / onUpdateHandle on adapter writes.

import { internalMutationGeneric } from "convex/server";
import { v } from "convex/values";

export const sessionOnCreateUpdater = internalMutationGeneric({
  args: { doc: v.any(), model: v.string() },
  handler: async (ctx, args) => {
    if (args.model === "session") {
      await ctx.db.patch(args.doc._id, { userAgent: "trigger-ran-on-create" });
    }
  },
});

export const sessionOnUpdateUpdater = internalMutationGeneric({
  args: { newDoc: v.any(), oldDoc: v.any(), model: v.string() },
  handler: async (ctx, args) => {
    if (args.model === "session") {
      await ctx.db.patch(args.newDoc._id, {
        userAgent: "trigger-ran-on-update",
      });
    }
  },
});
