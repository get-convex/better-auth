import { createApi } from "@convex-dev/better-auth";
import schema from "./schema";
import { createAuth } from "../../lib/auth";

console.log("createAuth", createAuth);

export const {
  create,
  findOne,
  findMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
} = createApi(schema, createAuth);
