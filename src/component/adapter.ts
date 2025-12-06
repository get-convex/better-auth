import { createApi } from "../client/index.js";
import { auth } from "../auth.js";
import schema from "./schema.js";

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
