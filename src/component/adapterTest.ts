import { createClient } from "../client/index.js";
import type { GenericCtx } from "../client/index.js";
import { api } from "./_generated/api.js";
import { action } from "./_generated/server.js";
import type { GenericActionCtx } from "convex/server";
import type { DataModel } from "./_generated/dataModel.js";
import type { BetterAuthOptions } from "better-auth";
import type { EmptyObject } from "convex-helpers";

// Hide vitest imports from esbuild, keep them out of the bundle
import type {
  beforeEach as beforeEachType,
  test as testType,
  expect as expectType,
} from "vitest";

const getTestImports = async () => {
  const vitestImportName = "vitest";
  const { beforeEach, test, expect } = await import(vitestImportName);
  return { beforeEach, test, expect } as {
    beforeEach: typeof beforeEachType;
    test: typeof testType;
    expect: typeof expectType;
  };
};

export const getAdapter =
  (ctx: GenericCtx<DataModel>) =>
  async (opts?: Omit<BetterAuthOptions, "database">) => {
    const authComponent = createClient<DataModel>(api as any, {
      verbose: false,
    });
    const adapterFactory = authComponent.adapter(ctx);
    const options = {
      ...(opts ?? {}),
      user: {
        ...(opts?.user ?? {}),
        // We don't currently support custom schema for tests, need to find a
        // way to do this.
        fields: undefined,
      },
    };
    return adapterFactory(options);
  };

// Tests need to run inside of a Convex function to use the Convex adapter
export const runTests = action(
  async (
    ctx: GenericActionCtx<DataModel>,
    args: { disableTests: Record<string, boolean> }
  ) => {
    const { test, expect } = await getTestImports();
    const get = getAdapter(ctx);

    const reset = async () => {
      const adapter = await get();
      await adapter.deleteMany({ model: "user", where: [] });
      await adapter.deleteMany({ model: "session", where: [] });
      await adapter.deleteMany({ model: "account", where: [] });
      await adapter.deleteMany({ model: "verification", where: [] });
      return adapter;
    };

    if (!args.disableTests.CREATE_MODEL) {
      test("CREATE_MODEL", async () => {
        const adapter = await reset();
        const user = await adapter.create({
          model: "user",
          data: { name: "foo", email: "foo@bar.com" },
        });
        expect(user).toBeTruthy();
        expect((user as any).id).toBeTruthy();
      });
    }

    if (!args.disableTests.FIND_MODEL) {
      test("FIND_MODEL", async () => {
        const adapter = await reset();
        const user = await adapter.create({
          model: "user",
          data: { name: "foo", email: "foo@bar.com" },
        });
        const found = await adapter.findOne({
          model: "user",
          where: [{ field: "id", value: (user as any).id }],
        });
        expect(found).toEqual(user);
      });
    }

    if (!args.disableTests.SHOULD_FIND_MANY) {
      test("SHOULD_FIND_MANY", async () => {
        const adapter = await reset();
        await adapter.create({
          model: "user",
          data: { name: "foo", email: "foo@bar.com" },
        });
        const users = await adapter.findMany({ model: "user", where: [] });
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);
      });
    }

    if (!args.disableTests.UPDATE_MODEL) {
      test("UPDATE_MODEL", async () => {
        const adapter = await reset();
        const user = await adapter.create({
          model: "user",
          data: { name: "foo", email: "foo@bar.com" },
        });
        const updated = await adapter.update({
          model: "user",
          where: [{ field: "id", value: (user as any).id }],
          update: { name: "bar" },
        });
        expect(updated).toBeTruthy();
        const found = await adapter.findOne({
          model: "user",
          where: [{ field: "id", value: (user as any).id }],
        });
        expect((found as any)?.name).toBe("bar");
      });
    }

    if (!args.disableTests.DELETE_MODEL) {
      test("DELETE_MODEL", async () => {
        const adapter = await reset();
        const user = await adapter.create({
          model: "user",
          data: { name: "foo", email: "foo@bar.com" },
        });
        await adapter.delete({
          model: "user",
          where: [{ field: "id", value: (user as any).id }],
        });
        const found = await adapter.findOne({
          model: "user",
          where: [{ field: "id", value: (user as any).id }],
        });
        expect(found).toEqual(null);
      });
    }
  }
);

export const runCustomTests = action(
  async (ctx: GenericActionCtx<DataModel>, _args: EmptyObject) => {
    const { beforeEach, test, expect } = await getTestImports();
    runCustomAdapterTests({
      beforeEach,
      test,
      expect,
      getAdapter: getAdapter(ctx),
    });
  }
);

function runCustomAdapterTests({
  beforeEach,
  test,
  expect,
  getAdapter,
}: {
  getAdapter: typeof getAdapter;
  beforeEach: typeof beforeEachType;
  test: typeof testType;
  expect: typeof expectType;
}) {
  beforeEach(async () => {
    const adapter = await getAdapter();
    await adapter.deleteMany({
      model: "user",
      where: [],
    });
    await adapter.deleteMany({
      model: "session",
      where: [],
    });
  });
  test("should handle lone range operators", async () => {
    const adapter = await getAdapter();
    const user = await adapter.create({
      model: "user",
      data: {
        name: "ab",
        email: "a@a.com",
      },
    });
    expect(
      await adapter.findMany({
        model: "user",
        where: [
          {
            field: "name",
            operator: "lt",
            value: "a",
          },
        ],
      })
    ).toEqual([]);
    expect(
      await adapter.findMany({
        model: "user",
        where: [
          {
            field: "name",
            operator: "lte",
            value: "a",
          },
        ],
      })
    ).toEqual([]);
    expect(
      await adapter.findMany({
        model: "user",
        where: [
          {
            field: "name",
            operator: "gt",
            value: "a",
          },
        ],
      })
    ).toEqual([user]);
    expect(
      await adapter.findMany({
        model: "user",
        where: [
          {
            field: "name",
            operator: "gte",
            value: "ab",
          },
        ],
      })
    ).toEqual([user]);
  });

  test("should handle compound indexes that include id field", async () => {
    const adapter = await getAdapter();
    const user = await adapter.create({
      model: "user",
      data: {
        name: "foo",
        email: "foo@bar.com",
      },
    });
    expect(
      await adapter.findOne({
        model: "user",
        where: [
          {
            field: "id",
            value: user.id,
          },
          {
            field: "name",
            value: "wrong name",
          },
        ],
      })
    ).toEqual(null);
    expect(
      await adapter.findOne({
        model: "user",
        where: [
          {
            field: "id",
            value: user.id,
          },
          {
            field: "name",
            value: "foo",
          },
        ],
      })
    ).toEqual(user);
    expect(
      await adapter.findOne({
        model: "user",
        where: [
          {
            field: "id",
            value: user.id,
          },
          {
            field: "name",
            value: "foo",
            operator: "lt",
          },
        ],
      })
    ).toEqual(null);
    expect(
      await adapter.findOne({
        model: "user",
        where: [
          {
            field: "id",
            value: user.id,
          },
          {
            field: "name",
            value: "foo",
            operator: "lte",
          },
        ],
      })
    ).toEqual(user);
    expect(
      await adapter.findOne({
        model: "user",
        where: [
          {
            field: "id",
            value: user.id,
          },
          {
            field: "name",
            value: "foo",
            operator: "gt",
          },
        ],
      })
    ).toEqual(null);
    expect(
      await adapter.findOne({
        model: "user",
        where: [
          {
            field: "id",
            value: user.id,
          },
          {
            field: "name",
            value: "foo",
            operator: "gte",
          },
        ],
      })
    ).toEqual(user);
    expect(
      await adapter.findOne({
        model: "user",
        where: [
          {
            field: "id",
            value: user.id,
          },
          {
            field: "name",
            operator: "in",
            value: ["wrong", "name"],
          },
        ],
      })
    ).toEqual(null);
    expect(
      await adapter.findOne({
        model: "user",
        where: [
          {
            field: "id",
            value: user.id,
          },
          {
            field: "name",
            operator: "in",
            value: ["foo"],
          },
        ],
      })
    ).toEqual(user);
  });
  test("should automatically paginate", async () => {
    const adapter = await getAdapter();
    for (let i = 0; i < 300; i++) {
      await adapter.create({
        model: "user",
        data: {
          name: `foo${i}`,
          email: `foo${i}@bar.com`,
        },
      });
    }
    // Better Auth defaults to a limit of 100
    expect(
      await adapter.findMany({
        model: "user",
      })
    ).toHaveLength(100);

    // Pagination has a hardcoded numItems max of 200, this tests that it can handle
    // specified limits beyond that
    expect(
      await adapter.findMany({
        model: "user",
        limit: 250,
      })
    ).toHaveLength(250);
    expect(
      await adapter.findMany({
        model: "user",
        limit: 350,
      })
    ).toHaveLength(300);
  });
  test("should handle OR where clauses", async () => {
    const adapter = await getAdapter();
    const user = await adapter.create({
      model: "user",
      data: {
        name: "foo",
        email: "foo@bar.com",
      },
    });
    expect(
      await adapter.findOne({
        model: "user",
        where: [
          { field: "name", value: "bar", connector: "OR" },
          { field: "name", value: "foo", connector: "OR" },
        ],
      })
    ).toEqual(user);
  });
  test("should handle OR where clauses with sortBy", async () => {
    const adapter = await getAdapter();
    const fooUser = await adapter.create({
      model: "user",
      data: {
        name: "foo",
        email: "foo@bar.com",
      },
    });
    const barUser = await adapter.create({
      model: "user",
      data: {
        name: "bar",
        email: "bar@bar.com",
      },
    });
    await adapter.create({
      model: "user",
      data: {
        name: "baz",
        email: "baz@bar.com",
      },
    });
    expect(
      await adapter.findMany({
        model: "user",
        where: [
          { field: "name", value: "bar", connector: "OR" },
          { field: "name", value: "foo", connector: "OR" },
        ],
        sortBy: { field: "name", direction: "asc" },
      })
    ).toEqual([barUser, fooUser]);
    expect(
      await adapter.findMany({
        model: "user",
        where: [
          { field: "name", value: "bar", connector: "OR" },
          { field: "name", value: "foo", connector: "OR" },
        ],
        sortBy: { field: "name", direction: "desc" },
      })
    ).toEqual([fooUser, barUser]);
  });
  test("should handle count", async () => {
    const adapter = await getAdapter();
    await adapter.create({
      model: "user",
      data: {
        name: "foo",
        email: "foo@bar.com",
      },
    });
    await adapter.create({
      model: "user",
      data: {
        name: "bar",
        email: "bar@bar.com",
      },
    });
    expect(
      await adapter.count({
        model: "user",
        where: [{ field: "name", value: "foo" }],
      })
    ).toEqual(1);
  });
  test("should handle queries with no index", async () => {
    const adapter = await getAdapter();
    const user = await adapter.create({
      model: "user",
      data: {
        name: "foo",
        email: "foo@bar.com",
        emailVerified: true,
      },
    });
    expect(
      await adapter.findOne({
        model: "user",
        where: [{ field: "emailVerified", value: true }],
      })
    ).toEqual(user);
    expect(
      await adapter.findOne({
        model: "user",
        where: [{ field: "emailVerified", value: false }],
      })
    ).toEqual(null);
  });

  test("should handle compound operator on non-unique field without an index", async () => {
    const adapter = await getAdapter();
    await adapter.create({
      model: "account",
      data: {
        accountId: "foo",
        providerId: "bar",
        userId: "baz",
        accessTokenExpiresAt: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });
    expect(
      await adapter.findOne({
        model: "account",
        where: [
          {
            operator: "lt",
            connector: "AND",
            field: "accessTokenExpiresAt",
            value: Date.now(),
          },
          {
            operator: "ne",
            connector: "AND",
            field: "accessTokenExpiresAt",
            value: null,
          },
        ],
      })
    ).toEqual(null);
  });

  test("should fail to create a record with a unique field that already exists", async () => {
    const adapter = await getAdapter();
    await adapter.create({
      model: "user",
      data: { name: "foo", email: "foo@bar.com" },
    });
    await expect(
      adapter.create({
        model: "user",
        data: { name: "foo", email: "foo@bar.com" },
      })
    ).rejects.toThrow("user email already exists");
  });

  test("should be able to compare against a date", async () => {
    const adapter = await getAdapter();
    const createdAt = new Date().toISOString();
    const user = await adapter.create({
      model: "user",
      data: {
        name: "foo",
        email: "foo@bar.com",
        createdAt,
      },
    });
    expect(
      await adapter.findOne({
        model: "user",
        where: [{ field: "createdAt", value: createdAt }],
      })
    ).toEqual(user);
  });
}
