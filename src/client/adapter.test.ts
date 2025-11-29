/// <reference types="vite/client" />

import { describe, expect, test } from "vitest";
import { runAdapterTest } from "better-auth/adapters/test";
import { convexTest } from "convex-test";
import { api } from "../component/_generated/api";
import schema from "../component/schema";
import { serialize } from "../component/adapterTest";
import type { DBAdapter } from "better-auth/adapters";

export const getAdapter = (t: ReturnType<typeof convexTest>) => async () => {
  return {
    id: "convex",
    create: async (data) => {
      const result = await t.mutation(api.adapterTest.create, {
        ...data,
        data: serialize(data.data),
      });
      return result;
    },
    findOne: async (data) => {
      return t.query(api.adapterTest.findOne, data);
    },
    findMany: async (data) => {
      return t.query(api.adapterTest.findMany, data);
    },
    count: async (data) => {
      return t.query(api.adapterTest.count, data);
    },
    update: async (data) => {
      return t.mutation(api.adapterTest.update, {
        ...data,
        update: serialize(data.update),
      });
    },
    updateMany: async (data) => {
      return t.mutation(api.adapterTest.updateMany, data);
    },
    delete: async (data) => {
      await t.mutation(api.adapterTest.delete, data);
    },
    deleteMany: async (data) => {
      return t.mutation(api.adapterTest.deleteMany, data);
    },
    transaction: false as any,
  } satisfies DBAdapter;
};

describe("Better Auth Adapter Tests", async () => {
  const _t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
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
    FIND_MODEL_WITH_MODIFIED_FIELD_NAME: status.active,
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

  await runAdapterTest({
    getAdapter: getAdapter(_t),
    disableTests,
  });
});

describe("Convex Adapter Tests", async () => {
  test("should handle lone range operators", async () => {
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
    const adapter = await getAdapter(t)();
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
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
    const adapter = await getAdapter(t)();
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
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
    const adapter = await getAdapter(t)();
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
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
    const adapter = await getAdapter(t)();
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
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
    const adapter = await getAdapter(t)();
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
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
    const adapter = await getAdapter(t)();
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
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
    const adapter = await getAdapter(t)();
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
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
    const adapter = await getAdapter(t)();
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
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
    const adapter = await getAdapter(t)();
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
});
