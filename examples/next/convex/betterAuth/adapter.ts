import { createApi } from "@convex-dev/better-auth";
import schema from "./schema";
import { createAuthOptions } from "../auth";

process.env.BETTER_AUTH_SECRET = "5csVL9Xi8upm96F7Qgv3e955dEaY6diFY2hFjPRvuyo=";

export const {
  create,
  findOne,
  findMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
} = createApi(schema, createAuthOptions);
