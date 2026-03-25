import { normalTestSuite } from "@better-auth/test-utils/adapter";

export const PLUGIN_TABLE_NORMAL_TESTS = [
  "create - should apply default values to fields",
  "create - should return null for nullable foreign keys",
  "create - should support arrays",
  "create - should support json",
  "findMany - should find many with both one-to-one and one-to-many joins",
  "findMany - should find many with one-to-one join",
  "findMany - should handle mixed joins correctly when some are missing",
  "findMany - should return empty array when base records don't exist with joins",
  "findMany - should return null for one-to-one join when joined records don't exist",
  "findMany - should select fields with one-to-one join",
  "findOne - should not apply defaultValue if value not found",
  "findOne - should return an object for one-to-one joins",
  "findOne - should return null for one-to-one join when joined record doesn't exist",
  "findOne - should select fields with one-to-one join",
  "findOne - should work with both one-to-one and one-to-many joins",
] as const;

const toEnableOnlyMap = (testNames: readonly string[]) => ({
  ALL: true,
  ...Object.fromEntries(testNames.map((testName) => [testName, false])),
});

export const pluginTableNormalTestSuite = () =>
  normalTestSuite({
    disableTests: toEnableOnlyMap(PLUGIN_TABLE_NORMAL_TESTS),
  });
