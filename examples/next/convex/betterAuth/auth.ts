import { query } from "./_generated/server";
import { doc } from "convex-helpers/validators";
import schema from "./schema";
import { v } from "convex/values";
import { createAuthOptions } from "../auth";
import { betterAuth } from "better-auth";

// Export a static instance for Better Auth schema generation
export const auth = betterAuth(createAuthOptions({} as any));

// Example of an in-component function
// Feel free to edit, omit, etc.
export const getUser = query({
  args: { userId: v.id("user") },
  returns: v.union(v.null(), doc(schema, "user")),
  handler: async (ctx, args) => {
    return ctx.db.get(args.userId);
  },
});
