import { normalTestSuite } from "@better-auth/test-utils/adapter";

const toEnableOnlyMap = (testNames: readonly string[]) => ({
  ALL: true,
  ...Object.fromEntries(testNames.map((testName) => [testName, false])),
});

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

export const renameFieldAndJoinTestSuite = () =>
  normalTestSuite({
    disableTests: toEnableOnlyMap(RENAME_FIELD_AND_JOIN_TESTS),
  });

export const renameModelUserCustomTestSuite = () =>
  normalTestSuite({
    disableTests: toEnableOnlyMap([RENAME_MODEL_USER_CUSTOM_TEST]),
  });

export const renameModelUserTableTestSuite = () =>
  normalTestSuite({
    disableTests: toEnableOnlyMap([RENAME_MODEL_USER_TABLE_TEST]),
  });

export const multiJoinsMissingRowsTestSuite = () =>
  normalTestSuite({
    disableTests: toEnableOnlyMap([MULTI_JOINS_MISSING_ROWS_TEST]),
  });
