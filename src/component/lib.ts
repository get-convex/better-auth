import { v } from "convex/values";
import { query } from "./_generated/server";

export const getUserById = query({
  args: { id: v.id("user") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
