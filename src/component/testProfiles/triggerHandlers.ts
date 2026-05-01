import { internalMutationGeneric } from "convex/server";
import { v } from "convex/values";

/**
 * Test trigger that imitates a session.onCreate user trigger updating the
 * row that was just inserted. Used by triggers.test.ts to verify that the
 * value returned from `api.adapter.create` reflects writes performed during
 * `onCreateHandle`.
 */
export const sessionOnCreateUpdater = internalMutationGeneric({
  args: { doc: v.any(), model: v.string() },
  handler: async (ctx, args) => {
    if (args.model === "session") {
      await ctx.db.patch(args.doc._id, { userAgent: "trigger-ran-on-create" });
    }
  },
});

/**
 * Test trigger that imitates a session.onUpdate user trigger updating the
 * row that was just patched. Used by triggers.test.ts to verify that the
 * value returned from `api.adapter.updateOne` reflects writes performed
 * during `onUpdateHandle`.
 */
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
