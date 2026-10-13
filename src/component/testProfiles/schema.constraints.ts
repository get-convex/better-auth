import { defineSchema, defineTable } from "convex/server";
import { tables } from "../schema.js";

// Only this test profile declares issuer+accountId uniqueness. Production
// accounts use Better Auth 1.7.7's providerId/accountId lookup semantics.
const account = defineTable(tables.account.validator)
  .index("issuer_accountId", ["issuer", "accountId"])
  .index("accountId", ["accountId"])
  .index("accountId_providerId", ["accountId", "providerId"])
  .index("providerId_userId", ["providerId", "userId"])
  .index("userId_providerId_accountId", ["userId", "providerId", "accountId"])
  .index("userId", ["userId"]);

export default defineSchema({ ...tables, account });
