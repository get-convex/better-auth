import { createTestSuite } from "@better-auth/test-utils/adapter";
import { getNormalTestSuiteTests } from "./basic.js";

const pickTests = (
  tests: ReturnType<typeof getNormalTestSuiteTests>,
  testNames: readonly string[],
) =>
  Object.fromEntries(
    Object.entries(tests).filter(([testName]) => testNames.includes(testName)),
  );

export const RENAME_FIELD_AND_JOIN_TESTS = [
  "findOne - should find a model with modified field name",
  "findOne - should join a model with modified field name",
  "findOne - should return null for failed base model lookup that has joins",
] as const;

export const RENAME_MODEL_USER_CUSTOM_TEST =
  "findOne - should find a model with modified model name" as const;

export const RENAME_MODEL_USER_TABLE_TEST =
  "findOne - backwards join with modified field name (session base, users-table join)" as const;

export const MULTI_JOINS_MISSING_ROWS_TEST =
  "findOne - multiple joins should return result even when some joined tables have no matching rows" as const;

export const renameFieldAndJoinTestSuite = createTestSuite(
  "normal-rename-field-and-join",
  {},
  (helpers, debugTools) => {
    const tests = getNormalTestSuiteTests(helpers, debugTools);
    return pickTests(tests, RENAME_FIELD_AND_JOIN_TESTS);
  },
);

export const renameModelUserCustomTestSuite = createTestSuite(
  "normal-rename-model-user-custom",
  {},
  (helpers, debugTools) => {
    const tests = getNormalTestSuiteTests(helpers, debugTools);
    return {
      [RENAME_MODEL_USER_CUSTOM_TEST]: tests[RENAME_MODEL_USER_CUSTOM_TEST],
    };
  },
);

export const renameModelUserTableTestSuite = createTestSuite(
  "normal-rename-model-user-table",
  {},
  (helpers, debugTools) => {
    const tests = getNormalTestSuiteTests(helpers, debugTools);
    return {
      [RENAME_MODEL_USER_TABLE_TEST]: tests[RENAME_MODEL_USER_TABLE_TEST],
    };
  },
);

export const multiJoinsMissingRowsTestSuite = createTestSuite(
  "normal-multi-joins-missing-rows",
  {},
  (helpers, debugTools) => {
    const tests = getNormalTestSuiteTests(helpers, debugTools);
    return {
      [MULTI_JOINS_MISSING_ROWS_TEST]: tests[MULTI_JOINS_MISSING_ROWS_TEST],
    };
  },
);
