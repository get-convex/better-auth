import { query } from "./_generated/server";
import { betterAuthComponent } from "./auth";
import { Id } from "./_generated/dataModel";

export const getCurrentUser = query({
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata) {
      return null;
    }
    // If desired you can merge the user metadata from Better Auth with
    // your appliation user data.
    const user = await ctx.db.get(userMetadata.userId as Id<"users">);
    return {
      ...userMetadata,
      ...user,
    };
  },
});
