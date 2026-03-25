import { createTestSuite, normalTestSuite } from "@better-auth/test-utils/adapter";
import {
  AUTH_FLOW_DEFAULT_BETTER_AUTH_OPTIONS,
  getAuthFlowSuiteTests,
} from "./auth-flow.js";

export const ADDITIONAL_FIELDS_NORMAL_TESTS = [
	"deleteMany - should delete many models with numeric values",
	"findMany - should find many models with sortBy",
	"findMany - should find many models with sortBy and limit",
	"findMany - should find many with join and sortBy",
	"findOne - should find a model with additional fields",
] as const;

export const ADDITIONAL_FIELDS_AUTH_FLOW_TEST =
	"should sign up with additional fields" as const;

const toDisableMap = (testNames: readonly string[]) =>
  Object.fromEntries(testNames.map((testName) => [testName, true]));

const toEnableOnlyMap = (testNames: readonly string[]) => ({
  ALL: true,
  ...Object.fromEntries(testNames.map((testName) => [testName, false])),
});

type SuiteOptions = {
  disableTests?: Record<string, boolean>;
  showDB?: () => Promise<void>;
};

export const coreNormalTestSuite = (options: SuiteOptions = {}) =>
  normalTestSuite({
    ...options,
    disableTests: {
      ...toDisableMap(ADDITIONAL_FIELDS_NORMAL_TESTS),
      ...(options.disableTests ?? {}),
    },
  });

export const additionalFieldsNormalTestSuite = () =>
  normalTestSuite({
    disableTests: toEnableOnlyMap(ADDITIONAL_FIELDS_NORMAL_TESTS),
  });

export const coreAuthFlowTestSuite = createTestSuite(
  "auth-flow",
  {
    defaultBetterAuthOptions: AUTH_FLOW_DEFAULT_BETTER_AUTH_OPTIONS,
  },
  (helpers) => {
    const tests = getAuthFlowSuiteTests(helpers);
    const { [ADDITIONAL_FIELDS_AUTH_FLOW_TEST]: _skip, ...remaining } = tests;
    return remaining;
  },
);

export const additionalFieldsAuthFlowTestSuite = createTestSuite(
  "auth-flow-additional-fields",
  {
    defaultBetterAuthOptions: AUTH_FLOW_DEFAULT_BETTER_AUTH_OPTIONS,
  },
  (helpers) => {
    const tests = getAuthFlowSuiteTests(helpers);
    return {
      [ADDITIONAL_FIELDS_AUTH_FLOW_TEST]: tests[ADDITIONAL_FIELDS_AUTH_FLOW_TEST],
    };
  },
);
