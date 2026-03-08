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

const toEnableOnlyMap = (testNames: readonly string[]) => ({
  ALL: true,
  ...Object.fromEntries(testNames.map((testName) => [testName, false])),
});

const JOINS_SUITE_TESTS = ["init - tests"] as const;
const UUID_SUITE_TESTS = ["init - tests"] as const;

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

const pluginTableProfileApi = {
  adapter: {
    create: (api as any).adapterPluginTable.create,
    findOne: (api as any).adapterPluginTable.findOne,
    findMany: (api as any).adapterPluginTable.findMany,
    updateOne: (api as any).adapterPluginTable.updateOne,
    updateMany: (api as any).adapterPluginTable.updateMany,
    deleteOne: (api as any).adapterPluginTable.deleteOne,
    deleteMany: (api as any).adapterPluginTable.deleteMany,
  },
};

const renameFieldProfileApi = {
  adapter: {
    create: (api as any).adapterRenameField.create,
    findOne: (api as any).adapterRenameField.findOne,
    findMany: (api as any).adapterRenameField.findMany,
    updateOne: (api as any).adapterRenameField.updateOne,
    updateMany: (api as any).adapterRenameField.updateMany,
    deleteOne: (api as any).adapterRenameField.deleteOne,
    deleteMany: (api as any).adapterRenameField.deleteMany,
  },
};

const renameUserCustomProfileApi = {
  adapter: {
    create: (api as any).adapterRenameUserCustom.create,
    findOne: (api as any).adapterRenameUserCustom.findOne,
    findMany: (api as any).adapterRenameUserCustom.findMany,
    updateOne: (api as any).adapterRenameUserCustom.updateOne,
    updateMany: (api as any).adapterRenameUserCustom.updateMany,
    deleteOne: (api as any).adapterRenameUserCustom.deleteOne,
    deleteMany: (api as any).adapterRenameUserCustom.deleteMany,
  },
};

const renameUserTableProfileApi = {
  adapter: {
    create: (api as any).adapterRenameUserTable.create,
    findOne: (api as any).adapterRenameUserTable.findOne,
    findMany: (api as any).adapterRenameUserTable.findMany,
    updateOne: (api as any).adapterRenameUserTable.updateOne,
    updateMany: (api as any).adapterRenameUserTable.updateMany,
    deleteOne: (api as any).adapterRenameUserTable.deleteOne,
    deleteMany: (api as any).adapterRenameUserTable.deleteMany,
  },
};

const organizationJoinsProfileApi = {
  adapter: {
    create: (api as any).adapterOrganizationJoins.create,
    findOne: (api as any).adapterOrganizationJoins.findOne,
    findMany: (api as any).adapterOrganizationJoins.findMany,
    updateOne: (api as any).adapterOrganizationJoins.updateOne,
    updateMany: (api as any).adapterOrganizationJoins.updateMany,
    deleteOne: (api as any).adapterOrganizationJoins.deleteOne,
    deleteMany: (api as any).adapterOrganizationJoins.deleteMany,
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
      pluginTableNormalTestSuite,
      renameFieldAndJoinTestSuite,
      renameModelUserCustomTestSuite,
      renameModelUserTableTestSuite,
      multiJoinsMissingRowsTestSuite,
      joinsTestSuite,
      transactionsTestSuite,
      uuidTestSuite,
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
    const pluginTableProfileClient = createClient<DataModel>(
      pluginTableProfileApi as any,
      {
        verbose: false,
      }
    );
    const renameFieldProfileClient = createClient<DataModel>(
      renameFieldProfileApi as any,
      {
        verbose: false,
      }
    );
    const renameUserCustomProfileClient = createClient<DataModel>(
      renameUserCustomProfileApi as any,
      {
        verbose: false,
      }
    );
    const renameUserTableProfileClient = createClient<DataModel>(
      renameUserTableProfileApi as any,
      {
        verbose: false,
      }
    );
    const organizationJoinsProfileClient = createClient<DataModel>(
      organizationJoinsProfileApi as any,
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
        joinsTestSuite({
          disableTests: toEnableOnlyMap(JOINS_SUITE_TESTS),
        }),
        uuidTestSuite({
          disableTests: toEnableOnlyMap(UUID_SUITE_TESTS),
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

    const { execute: executePluginTableProfile } = await testAdapter({
      adapter: () => {
        return pluginTableProfileClient.adapter(ctx);
      },
      runMigrations: () => {
        // Convex schema is static — no migrations needed.
      },
      overrideBetterAuthOptions: getOverrideBetterAuthOptions,
      prefixTests: "profile:plugin-table",
      tests: [pluginTableNormalTestSuite()],
    });

    const { execute: executeRenameFieldProfile } = await testAdapter({
      adapter: () => {
        return renameFieldProfileClient.adapter(ctx);
      },
      runMigrations: () => {
        // Convex schema is static — no migrations needed.
      },
      overrideBetterAuthOptions: getOverrideBetterAuthOptions,
      prefixTests: "profile:rename-field-join",
      tests: [renameFieldAndJoinTestSuite()],
    });

    const { execute: executeRenameUserCustomProfile } = await testAdapter({
      adapter: () => {
        return renameUserCustomProfileClient.adapter(ctx);
      },
      runMigrations: () => {
        // Convex schema is static — no migrations needed.
      },
      overrideBetterAuthOptions: getOverrideBetterAuthOptions,
      prefixTests: "profile:rename-user-custom",
      tests: [renameModelUserCustomTestSuite()],
    });

    const { execute: executeRenameUserTableProfile } = await testAdapter({
      adapter: () => {
        return renameUserTableProfileClient.adapter(ctx);
      },
      runMigrations: () => {
        // Convex schema is static — no migrations needed.
      },
      overrideBetterAuthOptions: getOverrideBetterAuthOptions,
      prefixTests: "profile:rename-user-table",
      tests: [renameModelUserTableTestSuite()],
    });

    const { execute: executeOrganizationJoinsProfile } = await testAdapter({
      adapter: () => {
        return organizationJoinsProfileClient.adapter(ctx);
      },
      runMigrations: () => {
        // Convex schema is static — no migrations needed.
      },
      overrideBetterAuthOptions: getOverrideBetterAuthOptions,
      prefixTests: "profile:organization-joins",
      tests: [multiJoinsMissingRowsTestSuite()],
    });

    executeBaseProfile();
    executeAdditionalFieldsProfile();
    executePluginTableProfile();
    executeRenameFieldProfile();
    executeRenameUserCustomProfile();
    executeRenameUserTableProfile();
    executeOrganizationJoinsProfile();
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
