import { mutation, query, QueryCtx } from "../component/_generated/server";
import { asyncMap } from "convex-helpers";
import { Infer, v } from "convex/values";
import { Doc, Id, TableNames } from "../component/_generated/dataModel";
import schema, { specialFields } from "../component/schema";
import {
  PaginationOptions,
  paginationOptsValidator,
  PaginationResult,
} from "convex/server";
import { paginator } from "convex-helpers/server/pagination";
import { partial } from "convex-helpers/validators";

export const adapterWhereValidator = v.object({
  field: v.string(),
  operator: v.optional(
    v.union(
      v.literal("lt"),
      v.literal("lte"),
      v.literal("gt"),
      v.literal("gte"),
      v.literal("eq"),
      v.literal("in"),
      v.literal("ne"),
      v.literal("contains"),
      v.literal("starts_with"),
      v.literal("ends_with")
    )
  ),
  value: v.union(
    v.string(),
    v.number(),
    v.boolean(),
    v.array(v.string()),
    v.array(v.number()),
    v.null()
  ),
  connector: v.optional(v.union(v.literal("AND"), v.literal("OR"))),
});

export const adapterArgsValidator = v.object({
  model: v.string(),
  where: v.optional(v.array(adapterWhereValidator)),
  sortBy: v.optional(
    v.object({
      field: v.string(),
      direction: v.union(v.literal("asc"), v.literal("desc")),
    })
  ),
  select: v.optional(v.array(v.string())),
  limit: v.optional(v.number()),
  unique: v.optional(v.boolean()),
});

const getUniqueFields = (table: TableNames, input: Record<string, any>) => {
  const fields = specialFields[table as keyof typeof specialFields];
  if (!fields) {
    return [];
  }
  return Object.entries(fields)
    .filter(
      ([key, value]) =>
        value.unique && Object.keys(input).includes(key as keyof typeof input)
    )
    .map(([key]) => key);
};

const checkUniqueFields = async (
  ctx: QueryCtx,
  table: TableNames,
  input: Record<string, any>,
  doc?: Doc<any>
) => {
  const uniqueFields = getUniqueFields(table, input);
  if (!uniqueFields.length) {
    return;
  }
  for (const field of uniqueFields) {
    const existingDoc = await ctx.db
      .query(table as any)
      .withIndex(field as any, (q) =>
        q.eq(field, input[field as keyof typeof input])
      )
      .unique();
    if (existingDoc && existingDoc._id !== doc?._id) {
      throw new Error(`${table} ${field} already exists`);
    }
  }
};

const findIndex = async (args: {
  model: string;
  where?: {
    field: string;
    operator?: string;
    value: any;
    connector?: "AND" | "OR";
  }[];
  sortBy?: {
    field: string;
    direction: "asc" | "desc";
  };
}) => {
  if (!args.where && !args.sortBy) {
    return;
  }
  if (args.where?.some((w) => w.field === "id")) {
    throw new Error("id is not a valid index field");
  }
  if (args.where?.some((w) => w.connector && w.connector !== "AND")) {
    throw new Error(
      `OR connector not supported: ${JSON.stringify(args.where)}`
    );
  }
  if (
    args.where?.some(
      (w) =>
        w.operator &&
        !["lt", "lte", "gt", "gte", "eq", "in"].includes(w.operator)
    )
  ) {
    throw new Error(
      `where clause not supported: ${JSON.stringify(args.where)}`
    );
  }
  const lowerBounds =
    args.where?.filter((w) => w.operator === "lt" || w.operator === "lte") ??
    [];
  if (lowerBounds.length > 1) {
    throw new Error(
      `cannot have more than one lower bound where clause: ${JSON.stringify(args.where)}`
    );
  }
  const upperBounds =
    args.where?.filter((w) => w.operator === "gt" || w.operator === "gte") ??
    [];
  if (upperBounds.length > 1) {
    throw new Error(
      `cannot have more than one upper bound where clause: ${JSON.stringify(args.where)}`
    );
  }
  const lowerBound = lowerBounds[0];
  const upperBound = upperBounds[0];
  if (lowerBound && upperBound && lowerBound.field !== upperBound.field) {
    throw new Error(
      `lower bound and upper bound must have the same field: ${JSON.stringify(args.where)}`
    );
  }
  const boundField = lowerBound?.field || upperBound?.field;
  if (
    boundField &&
    args.where?.some(
      (w) => w.field === boundField && w !== lowerBound && w !== upperBound
    )
  ) {
    throw new Error(
      `too many where clauses on the bound field: ${JSON.stringify(args.where)}`
    );
  }
  const indexFields =
    args.where
      ?.filter((w) => !w.operator || w.operator === "eq")
      .sort((a, b) => {
        return a.field.localeCompare(b.field);
      })
      .map((w) => [w.field, w.value]) ?? [];
  if (!indexFields?.length && !boundField && !args.sortBy) {
    return;
  }
  const indexes =
    schema.tables[args.model as keyof typeof schema.tables][" indexes"]();
  const sortField = args.sortBy?.field;

  // We internally use _creationTime in place of Better Auth's createdAt
  const indexName = indexFields
    .map(([field]) => field)
    .join("_")
    .concat(
      boundField && boundField !== "createdAt"
        ? `${indexFields.length ? "_" : ""}${boundField}`
        : ""
    )
    .concat(
      sortField && sortField !== "createdAt" && boundField !== sortField
        ? `${indexFields.length || boundField ? "_" : ""}${sortField}`
        : ""
    );
  if (!indexName && !boundField && !sortField) {
    return;
  }
  // Use the built in creationTime index if bounding or sorting by createdAt
  // with no other fields
  const index = !indexName
    ? {
        indexDescriptor: "by_creation_time",
        fields: [],
      }
    : indexes.find(({ indexDescriptor }) => {
        return boundField === "createdAt" || sortField === "createdAt"
          ? indexDescriptor === indexName
          : indexDescriptor.startsWith(indexName);
      });
  if (!index) {
    throw new Error(`Index ${indexName} not found for table ${args.model}`);
  }
  return {
    index: {
      indexDescriptor: index.indexDescriptor,
      fields: [...index.fields, "_creationTime"],
    },
    boundField,
    sortField,
    values: {
      eq: indexFields.map(([, value]) => value),
      lt: lowerBound?.operator === "lt" ? lowerBound.value : undefined,
      lte: lowerBound?.operator === "lte" ? lowerBound.value : undefined,
      gt: upperBound?.operator === "gt" ? upperBound.value : undefined,
      gte: upperBound?.operator === "gte" ? upperBound.value : undefined,
    },
  };
};

const selectFields = <T extends TableNames, D extends Doc<T>>(
  doc: D | null,
  select?: string[]
) => {
  if (!doc) {
    return null;
  }
  if (!select?.length) {
    return doc;
  }
  return select.reduce((acc, field) => {
    (acc as any)[field] = doc[field];
    return acc;
  }, {} as D);
};

// This is the core function for reading from the database, it parses and
// validates where conditions, selects indexes, and allows the caller to
// optionally paginate as needed.
const paginate = async (
  ctx: QueryCtx,
  args: Infer<typeof adapterArgsValidator> & {
    paginationOpts: PaginationOptions;
  }
): Promise<PaginationResult<Doc<any>>> => {
  // If any index is id, we can only return a single document
  const idWhere = args.where?.find((w) => w.field === "id");
  if (idWhere) {
    const doc = await ctx.db.get(idWhere.value as Id<TableNames>);
    return {
      page: [selectFields(doc, args.select)].filter(Boolean),
      isDone: true,
      continueCursor: "",
    };
  }
  const { index, values, boundField } = (await findIndex(args)) ?? {};
  const query = paginator(ctx.db, schema).query(args.model as any);
  const hasValues =
    values?.eq?.length ||
    values?.lt ||
    values?.lte ||
    values?.gt ||
    values?.gte;
  const indexedQuery =
    index && index.indexDescriptor !== "by_creation_time"
      ? query.withIndex(
          index.indexDescriptor,
          hasValues
            ? (q: any) => {
                for (const [idx, value] of (values?.eq ?? []).entries()) {
                  q = q.eq(index.fields[idx], value);
                }
                if (values?.lt) {
                  q = q.lt(boundField, values.lt);
                }
                if (values?.lte) {
                  q = q.lte(boundField, values.lte);
                }
                if (values?.gt) {
                  q = q.gt(boundField, values.gt);
                }
                if (values?.gte) {
                  q = q.gte(boundField, values.gte);
                }
                return q;
              }
            : undefined
        )
      : query;

  const orderedQuery = args.sortBy
    ? indexedQuery.order(args.sortBy.direction === "asc" ? "asc" : "desc")
    : indexedQuery;
  const result = await orderedQuery.paginate(args.paginationOpts);
  return {
    ...result,
    page: result.page.map((doc) => selectFields(doc, args.select)),
  };
};

const listOne = async (
  ctx: QueryCtx,
  args: Infer<typeof adapterArgsValidator>
): Promise<Doc<any> | null> => {
  return (
    await paginate(ctx, {
      ...args,
      paginationOpts: {
        numItems: 1,
        cursor: null,
      },
    })
  ).page[0];
};

export const create = mutation({
  args: {
    input: v.union(
      ...Object.entries(schema.tables).map(([model, table]) =>
        v.object({
          model: v.literal(model),
          where: v.optional(v.array(adapterWhereValidator)),
          data: v.object(table.validator.fields),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    await checkUniqueFields(
      ctx,
      args.input.model as TableNames,
      args.input.data
    );

    const id = await ctx.db.insert(args.input.model as any, args.input.data);
    const doc = await ctx.db.get(id);
    if (!doc) {
      throw new Error(`Failed to create ${args.input.model}`);
    }
    return doc;
  },
});

export const findOne = query({
  args: adapterArgsValidator,
  handler: async (ctx, args) => {
    return await listOne(ctx, args);
  },
});

export const findMany = query({
  args: {
    ...adapterArgsValidator.fields,
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await paginate(ctx, args);
  },
});

export const updateOne = mutation({
  args: {
    input: v.union(
      ...Object.entries(schema.tables).map(([model, table]) =>
        v.object({
          model: v.literal(model),
          where: v.optional(v.array(adapterWhereValidator)),
          update: v.object(partial(table.validator.fields)),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const doc = await listOne(ctx, args.input);
    if (!doc) {
      throw new Error(`Failed to update ${args.input.model}`);
    }
    await checkUniqueFields(
      ctx,
      args.input.model as TableNames,
      args.input.update,
      doc
    );
    await ctx.db.patch(doc._id, args.input.update as any);
    const updatedDoc = await ctx.db.get(doc._id);
    if (!updatedDoc) {
      throw new Error(`Failed to update ${args.input.model}`);
    }
    return updatedDoc;
  },
});

export const updateMany = mutation({
  args: {
    input: v.union(
      ...Object.entries(schema.tables).map(([model, table]) =>
        v.object({
          ...adapterArgsValidator.fields,
          model: v.literal(model),
          where: v.optional(v.array(adapterWhereValidator)),
          update: v.object(partial(table.validator.fields)),
          paginationOpts: paginationOptsValidator,
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { page, ...result } = await paginate(ctx, args.input);
    if (args.input.update) {
      const uniqueFields = getUniqueFields(
        args.input.model as TableNames,
        args.input.update ?? {}
      );
      if (uniqueFields.length && page.length > 1) {
        throw new Error(
          `Attempted to set unique fields in multiple documents in ${args.input.model} with the same value. Fields: ${uniqueFields.join(", ")}`
        );
      }
      await asyncMap(page, async (doc) => {
        await checkUniqueFields(
          ctx,
          args.input.model as TableNames,
          args.input.update ?? {},
          doc
        );
        await ctx.db.patch(doc._id, args.input.update as any);
      });
    }
    return {
      ...result,
      count: page.length,
    };
  },
});

export const deleteOne = mutation({
  args: adapterArgsValidator,
  handler: async (ctx, args) => {
    const doc = await listOne(ctx, args);
    if (!doc) {
      return;
    }
    await ctx.db.delete(doc._id);
    return doc;
  },
});

export const deleteMany = mutation({
  args: {
    ...adapterArgsValidator.fields,
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { page, ...result } = await paginate(ctx, args);
    await asyncMap(page, async (doc) => {
      await ctx.db.delete(doc._id);
    });
    return {
      ...result,
      count: page.length,
    };
  },
});

// Get the session via sessionId in jwt claims
// TODO: this needs a refresh, subquery only necessary for actions
export const getCurrentSession = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return ctx.db.get(identity.sessionId as Id<"session">);
  },
});

// TODO: rewrite functions below here to be dynamic

export const getIn = query({
  args: adapterArgsValidator,
  handler: async (ctx, args) => {
    const where = args.where?.[0];
    if (!where || where.operator !== "in" || args.where?.length !== 1) {
      throw new Error("where must be a single in clause");
    }
    return (
      await asyncMap(where.value as any[], async (value) => {
        if (where.field === "id") {
          return [await ctx.db.get(value as Id<TableNames>)];
        }
        const query = ctx.db
          .query(args.model as any)
          .withIndex(where.field as any, (q) => q.eq(where.field, value));
        if (args.limit) {
          return await query.take(args.limit);
        }
        return await query.collect();
      })
    )
      .flat()
      .filter(Boolean);
  },
});

export const deleteIn = mutation({
  args: {
    input: v.union(
      v.object({
        table: v.literal("session"),
        field: v.literal("token"),
        values: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { table, field, values } = args.input;
    const docs = await asyncMap(values, async (value) => {
      const doc = await ctx.db
        .query(table)
        .withIndex(field as any, (q) => q.eq(field, value))
        .unique();
      if (!doc) {
        return;
      }
      await ctx.db.delete(doc._id);
      return doc;
    });
    return docs.filter(Boolean).length;
  },
});
