import { createClient } from "../client/index.js";
import { api } from "./_generated/api.js";
import { action } from "./_generated/server.js";
import type { GenericActionCtx } from "convex/server";
import type { DataModel } from "./_generated/dataModel.js";
import type { EmptyObject } from "convex-helpers";

// Tests need to run inside of a Convex function to use the Convex adapter.
// Test dependencies are dynamically imported to keep them out of the
// production bundle. convex-test runs in the vitest process, so vitest
// globals are available through dynamic imports.

const NORMAL_DISABLED_TESTS = [
  "create - should apply default values to fields",
  "create - should return null for nullable foreign keys",
  "create - should support arrays",
  "create - should support json",
  "create - should use generateId if provided",
  "findMany - should be able to perform a complex limited join",
  "findMany - should find many models with limit and offset",
  "findMany - should find many models with offset",
  "findMany - should find many models with sortBy and limit and offset",
  "findMany - should find many models with sortBy and limit and offset and where",
  "findMany - should find many models with sortBy and offset",
  "findMany - should find many with both one-to-one and one-to-many joins",
  "findMany - should find many with join and offset",
  "findMany - should find many with join, where, limit, and offset",
  "findMany - should find many with one-to-one join",
  "findMany - should handle mixed joins correctly when some are missing",
  "findMany - should return empty array when base records don't exist with joins",
  "findMany - should return null for one-to-one join when joined records don't exist",
  "findMany - should select fields with one-to-one join",
  "findOne - backwards join with modified field name (session base, users-table join)",
  "findOne - multiple joins should return result even when some joined tables have no matching rows",
  "findOne - should find a model with modified field name",
  "findOne - should find a model with modified model name",
  "findOne - should join a model with modified field name",
  "findOne - should not apply defaultValue if value not found",
  "findOne - should return an object for one-to-one joins",
  "findOne - should return null for failed base model lookup that has joins",
  "findOne - should return null for one-to-one join when joined record doesn't exist",
  "findOne - should select fields with one-to-one join",
  "findOne - should work with both one-to-one and one-to-many joins",
] as const;

const toDisableMap = (testNames: readonly string[]) =>
  Object.fromEntries(testNames.map((testName) => [testName, true]));

const getOverrideBetterAuthOptions = (opts: any) => ({
  ...opts,
  advanced: {
    ...opts.advanced,
    database: {
      ...opts.advanced?.database,
      generateId: "uuid",
    },
  },
});

const additionalFieldsProfileApi = {
  adapter: {
    create: (api as any).adapterAdditionalFields.create,
    findOne: (api as any).adapterAdditionalFields.findOne,
    findMany: (api as any).adapterAdditionalFields.findMany,
    updateOne: (api as any).adapterAdditionalFields.updateOne,
    updateMany: (api as any).adapterAdditionalFields.updateMany,
    deleteOne: (api as any).adapterAdditionalFields.deleteOne,
    deleteMany: (api as any).adapterAdditionalFields.deleteMany,
  },
};

export const runTests = action(
  async (ctx: GenericActionCtx<DataModel>, _args: EmptyObject) => {
    const testUtilsImport = "@better-auth/test-utils/adapter";
    const { testAdapter } = await import(testUtilsImport);
    const adapterFactoryImport = "../test/adapter-factory/index.js";
    const {
      coreNormalTestSuite,
      coreAuthFlowTestSuite,
      additionalFieldsNormalTestSuite,
      additionalFieldsAuthFlowTestSuite,
      transactionsTestSuite,
      convexCustomTestSuite,
    } = await import(adapterFactoryImport);

    const baseProfileClient = createClient<DataModel>(api as any, {
      verbose: false,
    });
    const additionalFieldsProfileClient = createClient<DataModel>(
      additionalFieldsProfileApi as any,
      {
        verbose: false,
      }
    );

    const { execute: executeBaseProfile } = await testAdapter({
      adapter: () => {
        return baseProfileClient.adapter(ctx);
      },
      runMigrations: () => {
        // Convex schema is static — no migrations needed.
      },
      overrideBetterAuthOptions: getOverrideBetterAuthOptions,
      tests: [
        coreNormalTestSuite({
          disableTests: toDisableMap(NORMAL_DISABLED_TESTS),
        }),
        transactionsTestSuite({ disableTests: { ALL: true } }),
        coreAuthFlowTestSuite(),
        convexCustomTestSuite(),
      ],
    });

    const { execute: executeAdditionalFieldsProfile } = await testAdapter({
      adapter: () => {
        return additionalFieldsProfileClient.adapter(ctx);
      },
      runMigrations: () => {
        // Convex schema is static — no migrations needed.
      },
      overrideBetterAuthOptions: getOverrideBetterAuthOptions,
      prefixTests: "profile:additional-fields",
      tests: [
        additionalFieldsNormalTestSuite(),
        additionalFieldsAuthFlowTestSuite(),
      ],
    });

    executeBaseProfile();
    executeAdditionalFieldsProfile();
  }
);

// Keep this export during migration to avoid breaking generated component types.
export const runCustomTests = action(
  async (ctx: GenericActionCtx<DataModel>, _args: EmptyObject) => {
    const testUtilsImport = "@better-auth/test-utils/adapter";
    const { testAdapter } = await import(testUtilsImport);
    const adapterFactoryImport = "../test/adapter-factory/index.js";
    const { convexCustomTestSuite } = await import(adapterFactoryImport);
    const authComponent = createClient<DataModel>(api as any, {
      verbose: false,
    });

    const { execute } = await testAdapter({
      adapter: () => {
        return authComponent.adapter(ctx);
      },
      runMigrations: () => {},
      overrideBetterAuthOptions: getOverrideBetterAuthOptions,
      tests: [convexCustomTestSuite()],
    });
    execute();
  }
);
