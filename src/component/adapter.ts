import { createApi } from "../client";
import { auth } from "../auth";
import schema from "./schema";

export const {
  create,
  findOne,
  findMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
  migrationRemoveUserId,
} = createApi(schema, () => auth);
