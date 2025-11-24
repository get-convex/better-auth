import { type Auth, betterAuth } from "better-auth";
import {
  type DefaultFunctionArgs,
  type FunctionReference,
  type GenericActionCtx,
  type GenericDataModel,
  type GenericMutationCtx,
  type GenericQueryCtx,
} from "convex/server";

export type CreateAuth<
  DataModel extends GenericDataModel,
  A extends ReturnType<typeof betterAuth> = Auth,
> =
  | ((ctx: GenericCtx<DataModel>) => A)
  | ((ctx: GenericCtx<DataModel>, opts?: { optionsOnly?: boolean }) => A);

export const getStaticAuth = <
  DataModel extends GenericDataModel,
  Auth extends ReturnType<typeof betterAuth>,
>(
  createAuth: CreateAuth<DataModel, Auth>
): Auth => {
  return createAuth({} as any, { optionsOnly: true });
};

export type EventFunction<T extends DefaultFunctionArgs> = FunctionReference<
  "mutation",
  "internal" | "public",
  T
>;

export type GenericCtx<DataModel extends GenericDataModel = GenericDataModel> =
  | GenericQueryCtx<DataModel>
  | GenericMutationCtx<DataModel>
  | GenericActionCtx<DataModel>;

export type RunMutationCtx<DataModel extends GenericDataModel> = (
  | GenericMutationCtx<DataModel>
  | GenericActionCtx<DataModel>
) & {
  runMutation: GenericMutationCtx<DataModel>["runMutation"];
};

export const isQueryCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): ctx is GenericQueryCtx<DataModel> => {
  return "db" in ctx;
};

export const isMutationCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): ctx is GenericMutationCtx<DataModel> => {
  return "db" in ctx && "scheduler" in ctx;
};

export const isActionCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): ctx is GenericActionCtx<DataModel> => {
  return "runAction" in ctx;
};

export const isRunMutationCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): ctx is RunMutationCtx<DataModel> => {
  return "runMutation" in ctx;
};

export const requireQueryCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): GenericQueryCtx<DataModel> => {
  if (!isQueryCtx(ctx)) {
    throw new Error("Query context required");
  }
  return ctx;
};

export const requireMutationCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): GenericMutationCtx<DataModel> => {
  if (!isMutationCtx(ctx)) {
    throw new Error("Mutation context required");
  }
  return ctx;
};

export const requireActionCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): GenericActionCtx<DataModel> => {
  if (!isActionCtx(ctx)) {
    throw new Error("Action context required");
  }
  return ctx;
};

export const requireRunMutationCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): RunMutationCtx<DataModel> => {
  if (!isRunMutationCtx(ctx)) {
    throw new Error("Mutation or action context required");
  }
  return ctx;
};
