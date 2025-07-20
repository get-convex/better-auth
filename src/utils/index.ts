import { RunActionCtx, RunCtx, RunMutationCtx, RunQueryCtx } from "../client";

export const requireEnv = (name: string) => {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Missing environment variable \`${name}\``);
  }
  return value;
};

export const isQueryCtx = (ctx: RunCtx): ctx is RunQueryCtx => {
  return "runQuery" in ctx;
};

export const isMutationCtx = (ctx: RunCtx): ctx is RunMutationCtx => {
  return "runMutation" in ctx;
};

export const isActionCtx = (ctx: RunCtx): ctx is RunActionCtx => {
  return "runAction" in ctx;
};

export const requireQueryCtx = (ctx: RunCtx): RunQueryCtx => {
  if (!isQueryCtx(ctx)) {
    throw new Error("Query context required");
  }
  return ctx;
};

export const requireMutationCtx = (ctx: RunCtx): RunMutationCtx => {
  if (!isMutationCtx(ctx)) {
    throw new Error("Mutation context required");
  }
  return ctx;
};

export const requireActionCtx = (ctx: RunCtx): RunActionCtx => {
  if (!isActionCtx(ctx)) {
    throw new Error("Action context required");
  }
  return ctx;
};
