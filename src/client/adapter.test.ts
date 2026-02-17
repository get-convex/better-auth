/// <reference types="vite/client" />

import { describe } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../component/_generated/api.js";
import schema from "../component/schema.js";
import type { DataModel } from "../component/_generated/dataModel.js";

describe("Better Auth Adapter Tests", async () => {
  const status = {
    active: "active",
    only: "only",
    notSupported: "not supported",
  } as const;
  const tests: Record<string, (typeof status)[keyof typeof status]> = {
    CREATE_MODEL: status.active,
    CREATE_MODEL_SHOULD_ALWAYS_RETURN_AN_ID: status.active,
    FIND_MODEL: status.active,
    FIND_MODEL_WITHOUT_ID: status.active,
    FIND_MODEL_WITH_SELECT: status.active,
    // Requires schema overrides we don't currently support in this package.
    FIND_MODEL_WITH_MODIFIED_FIELD_NAME: status.notSupported,
    UPDATE_MODEL: status.active,
    SHOULD_FIND_MANY: status.active,
    SHOULD_FIND_MANY_WITH_WHERE: status.active,
    SHOULD_FIND_MANY_WITH_OPERATORS: status.active,
    SHOULD_WORK_WITH_REFERENCE_FIELDS: status.active,
    SHOULD_FIND_MANY_WITH_NOT_IN_OPERATOR: status.active,
    SHOULD_FIND_MANY_WITH_SORT_BY: status.active,
    SHOULD_FIND_MANY_WITH_LIMIT: status.active,
    SHOULD_UPDATE_WITH_MULTIPLE_WHERE: status.active,
    DELETE_MODEL: status.active,
    SHOULD_DELETE_MANY: status.active,
    SHOULD_NOT_THROW_ON_DELETE_RECORD_NOT_FOUND: status.active,
    SHOULD_NOT_THROW_ON_RECORD_NOT_FOUND: status.active,
    SHOULD_FIND_MANY_WITH_CONTAINS_OPERATOR: status.active,
    SHOULD_SEARCH_USERS_WITH_STARTS_WITH: status.active,
    SHOULD_SEARCH_USERS_WITH_ENDS_WITH: status.active,
    // Use local install and Convex paginated queries
    SHOULD_FIND_MANY_WITH_OFFSET: status.notSupported,
    // Convex generates ids on insert
    SHOULD_PREFER_GENERATE_ID_IF_PROVIDED: status.notSupported,
    // Transactions are inherent for auth.api and not possible for authClient
    SHOULD_ROLLBACK_FAILING_TRANSACTION: status.notSupported,
    SHOULD_RETURN_TRANSACTION_RESULT: status.notSupported,
    SHOULD_FIND_MANY_WITH_CONNECTORS: status.active,
  };

  const disableTests = Object.fromEntries(
    Object.entries(tests).map((entry, idx, arr) => {
      if (arr.some((e) => e[1] === status.only)) {
        return [entry[0], !(entry[1] === status.only)];
      }
      return [entry[0], !(entry[1] === status.active)];
    })
  );

  const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
  await t.action(api.adapterTest.runTests, { disableTests });
});

describe("Convex Adapter Tests", async () => {
  const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
  await t.action(api.adapterTest.runCustomTests);
});
