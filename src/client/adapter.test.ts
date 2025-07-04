/// <reference types="vite/client" />

import { describe, expect, test } from "vitest";
import { runAdapterTest } from "better-auth/adapters/test";
import { convexTest } from "convex-test";
import { api } from "../component/_generated/api";
import schema from "../component/schema";
import { serialize } from "../component/adapterTest";
import { Adapter } from "better-auth";

describe("convex adapter", async () => {
  const _t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
  const getAdapter =
    (t: typeof _t) =>
    async (betterAuthOptions = {}): Promise<Adapter> => {
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
          const result = await t.query(api.adapterTest.findOne, data);
          console.log("findOne result adapter", result);
          return result;
        },
        findMany: async (data) => {
          const result = await t.query(api.adapterTest.findMany, data);
          console.log("findMany result adapter", result);
          return result;
        },
        count: async () => {
          throw new Error("count not implemented");
        },
        update: async (data) => {
          const result = await t.mutation(api.adapterTest.update, {
            ...data,
            update: serialize(data.update),
          });
          return result;
        },
        updateMany: async (data) => {
          const result = await t.mutation(api.adapterTest.updateMany, data);
          return result;
        },
        delete: async (data) => {
          await t.mutation(api.adapterTest.delete, data);
        },
        deleteMany: async (data) => {
          const result = await t.mutation(api.adapterTest.deleteMany, data);
          return result;
        },
      };
    };
  await runAdapterTest({
    getAdapter: getAdapter(_t),
    disableTests: {
      CREATE_MODEL: false,
      CREATE_MODEL_SHOULD_ALWAYS_RETURN_AN_ID: false,
      FIND_MODEL: false,
      FIND_MODEL_WITHOUT_ID: false,
      FIND_MODEL_WITH_SELECT: false,
      FIND_MODEL_WITH_MODIFIED_FIELD_NAME: false,
      UPDATE_MODEL: false,
      SHOULD_FIND_MANY: false,
      SHOULD_FIND_MANY_WITH_WHERE: false,
      SHOULD_FIND_MANY_WITH_OPERATORS: false,
      SHOULD_WORK_WITH_REFERENCE_FIELDS: false,
      SHOULD_FIND_MANY_WITH_SORT_BY: false,
      SHOULD_FIND_MANY_WITH_LIMIT: false,
      SHOULD_FIND_MANY_WITH_OFFSET: true, // disabled for now
      SHOULD_UPDATE_WITH_MULTIPLE_WHERE: false,
      DELETE_MODEL: false,
      SHOULD_DELETE_MANY: false,
      SHOULD_NOT_THROW_ON_DELETE_RECORD_NOT_FOUND: false,
      SHOULD_NOT_THROW_ON_RECORD_NOT_FOUND: false,

      // Disabled for now
      SHOULD_FIND_MANY_WITH_CONTAINS_OPERATOR: true,
      SHOULD_SEARCH_USERS_WITH_STARTS_WITH: true,
      SHOULD_SEARCH_USERS_WITH_ENDS_WITH: true,
      SHOULD_PREFER_GENERATE_ID_IF_PROVIDED: true,
    },
  });

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
    const res = await adapter.findMany({
      model: "user",
      where: [
        {
          field: "name",
          operator: "lt",
          value: "a",
        },
      ],
    });
    expect(res).toEqual([]);
    const res2 = await adapter.findMany({
      model: "user",
      where: [
        {
          field: "name",
          operator: "lte",
          value: "a",
        },
      ],
    });
    expect(res2).toEqual([]);
    const res3 = await adapter.findMany({
      model: "user",
      where: [
        {
          field: "name",
          operator: "gt",
          value: "a",
        },
      ],
    });
    expect(res3).toEqual([user]);
    const res4 = await adapter.findMany({
      model: "user",
      where: [
        {
          field: "name",
          operator: "gte",
          value: "ab",
        },
      ],
    });
    expect(res4).toEqual([user]);
  });
});
