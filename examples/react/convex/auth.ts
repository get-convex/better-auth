import {
  convexAdapter,
  createClient,
  type GenericCtx,
} from "@convex-dev/better-auth";
import { components } from "./_generated/api";
import { query } from "./_generated/server";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { DataModel } from "./_generated/dataModel";

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    trustedOrigins: [siteUrl],
    database: convexAdapter<DataModel, typeof ctx>(ctx, authComponent),
    plugins: [twoFactor(), crossDomain({ siteUrl }), convex()],
  });
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
