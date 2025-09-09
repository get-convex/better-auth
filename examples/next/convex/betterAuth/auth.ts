import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { doc } from "convex-helpers/validators";
import schema from "./schema";
import { v } from "convex/values";
import { createAuth } from "../auth";

// Export a static instance for Better Auth schema generation
export const auth = createAuth({} as any);

// Example of an in-component function
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  returns: v.union(v.null(), doc(schema, "user")),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return await ctx.db.get(identity.subject as Id<"user">);
  },
});
