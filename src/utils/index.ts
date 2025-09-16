import {
  GenericActionCtx,
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import { GenericCtx } from "../client";

/**
 * @deprecated Just reference variables direct, the component will
 * use other ways to make sure the appropriate variables are available
 */
export const requireEnv = (name: string) => {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Missing environment variable \`${name}\``);
  }
  return value;
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
