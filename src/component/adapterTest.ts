import {
  convexAdapter,
  AuthFunctions,
  BetterAuth,
  PublicAuthFunctions,
} from "../client";
import { api, internal } from "./_generated/api";
import { GenericCtx, mutation, query } from "./_generated/server";
import {
  GenericMutationCtx,
  GenericQueryCtx,
  RegisteredMutation,
  RegisteredQuery,
} from "convex/server";

// @ts-expect-error - this is a test
const authFunctions: AuthFunctions = internal.adapterTest as any;

const publicAuthFunctions: PublicAuthFunctions = api.adapterTest as any;

export const betterAuthComponent = new BetterAuth(api as any, {
  authFunctions,
  publicAuthFunctions,
  verbose: false,
}) as any;

export const createAdapter = (ctx: GenericCtx) =>
  convexAdapter(ctx, betterAuthComponent, {
    debugLogs: {
      isRunningAdapterTests: true,
    },
  });

export const {
  createUser,
  deleteUser,
  updateUser,
  createSession,
  isAuthenticated,
} = betterAuthComponent.createAuthFunctions({
  onCreateUser: async () => {
    // return a random string as a userId
    return Math.random().toString(36).substring(2, 15);
  },
});

export const deserialize = (data: any) => {
  const dateStringRegex =
    /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      dateStringRegex.test(value as string) ? new Date(value as string) : value,
    ])
  );
};

export const serialize = (data: any) => {
  if (!data) {
    return data;
  }
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString() : value,
    ])
  );
};

export const create: RegisteredMutation<"public", any, Promise<any>> = mutation(
  async (ctx: GenericMutationCtx<any>, args: any) => {
    const adapter = createAdapter(ctx);
    const result = await adapter({}).create({
      ...args,
      data: deserialize(args.data),
    });
    return serialize(result);
  }
);

export const findOne: RegisteredQuery<"public", any, Promise<any>> = query(
  async (ctx: GenericQueryCtx<any>, args: any) => {
    const adapter = createAdapter(ctx);
    const result = await adapter({}).findOne(args);
    return serialize(result);
  }
);

export const findMany: RegisteredQuery<"public", any, Promise<any>> = query(
  async (ctx: GenericQueryCtx<any>, args: any) => {
    const adapter = createAdapter(ctx);
    const result = await adapter({}).findMany(args);
    return result.map(serialize);
  }
);

export const count: RegisteredQuery<"public", any, Promise<any>> = query(
  async (ctx: GenericQueryCtx<any>, args: any) => {
    const adapter = createAdapter(ctx);
    return adapter({}).count(args);
  }
);

export const update: RegisteredMutation<"public", any, Promise<any>> = mutation(
  async (ctx: GenericMutationCtx<any>, args: any) => {
    const adapter = createAdapter(ctx);
    const result = await adapter({}).update({
      ...args,
      update: deserialize(args.update),
    });
    return serialize(result);
  }
);

export const updateMany: RegisteredMutation<
  "public",
  any,
  Promise<any>
> = mutation(async (ctx: GenericMutationCtx<any>, args: any) => {
  const adapter = createAdapter(ctx);
  return adapter({}).updateMany(args);
});

const deleteMutation: RegisteredMutation<
  "public",
  any,
  Promise<any>
> = mutation(async (ctx: GenericMutationCtx<any>, args: any) => {
  const adapter = createAdapter(ctx);
  await adapter({}).delete(args);
});
export { deleteMutation as delete };

export const deleteMany: RegisteredMutation<
  "public",
  any,
  Promise<any>
> = mutation(async (ctx: GenericMutationCtx<any>, args: any) => {
  const adapter = createAdapter(ctx);
  return adapter({}).deleteMany(args);
});
