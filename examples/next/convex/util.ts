import { typedV } from "convex-helpers/validators";
import schema from "./schema";

export const requireEnv = (name: string) => {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Missing environment variable \`${name}\``);
  }
  return value;
};

export const vv = typedV(schema);
