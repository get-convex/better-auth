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
import { partial } from "convex-helpers/validators";
import { stream } from "convex-helpers/server/stream";
import { mergedStream } from "convex-helpers/server/stream";
import { stripIndent } from "common-tags";

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
  offset: v.optional(v.number()),
  unique: v.optional(v.boolean()),
});

const isUniqueField = (model: TableNames, field: string) => {
  const fields = specialFields[model as keyof typeof specialFields];
  if (!fields) {
    return false;
  }
  return Object.entries(fields)
    .filter(([, value]) => value.unique)
    .map(([key]) => key)
    .includes(field);
};
const hasUniqueFields = (model: TableNames, input: Record<string, any>) => {
  for (const field of Object.keys(input)) {
    if (isUniqueField(model, field)) {
      return true;
    }
  }
  return false;
};

const checkUniqueFields = async (
  ctx: QueryCtx,
  table: TableNames,
  input: Record<string, any>,
  doc?: Doc<any>
) => {
  if (!hasUniqueFields(table, input)) {
    return;
  }
  for (const field of Object.keys(input)) {
    if (!isUniqueField(table, field)) {
      continue;
    }
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

const findIndex = (args: {
  model: string;
  where?: {
    field: string;
    operator?:
      | "lt"
      | "lte"
      | "gt"
      | "gte"
      | "eq"
      | "in"
      | "ne"
      | "contains"
      | "starts_with"
      | "ends_with";
    value: string | number | boolean | null | string[] | number[];
    connector?: "AND" | "OR";
  }[];
  sortBy?: {
    field: string;
    direction: "asc" | "desc";
  };
}) => {
  if (
    (args.where?.length ?? 0) > 1 &&
    args.where?.some((w) => w.connector === "OR")
  ) {
    throw new Error(
      `OR connector not supported with multiple where statements in findIndex, split up the where statements before calling findIndex: ${JSON.stringify(args.where)}`
    );
  }
  const where = args.where?.filter((w) => {
    return (
      (!w.operator ||
        ["lt", "lte", "gt", "gte", "eq", "in"].includes(w.operator)) &&
      w.field !== "id"
    );
  });
  if (!where?.length && !args.sortBy) {
    return;
  }
  const lowerBounds =
    where?.filter((w) => w.operator === "lt" || w.operator === "lte") ?? [];
  if (lowerBounds.length > 1) {
    throw new Error(
      `cannot have more than one lower bound where clause: ${JSON.stringify(where)}`
    );
  }
  const upperBounds =
    where?.filter((w) => w.operator === "gt" || w.operator === "gte") ?? [];
  if (upperBounds.length > 1) {
    throw new Error(
      `cannot have more than one upper bound where clause: ${JSON.stringify(where)}`
    );
  }
  const lowerBound = lowerBounds[0];
  const upperBound = upperBounds[0];
  if (lowerBound && upperBound && lowerBound.field !== upperBound.field) {
    throw new Error(
      `lower bound and upper bound must have the same field: ${JSON.stringify(where)}`
    );
  }
  const boundField = lowerBound?.field || upperBound?.field;
  if (
    boundField &&
    where?.some(
      (w) => w.field === boundField && w !== lowerBound && w !== upperBound
    )
  ) {
    throw new Error(
      `too many where clauses on the bound field: ${JSON.stringify(where)}`
    );
  }
  const indexEqFields =
    where
      ?.filter((w) => !w.operator || w.operator === "eq")
      .sort((a, b) => {
        return a.field.localeCompare(b.field);
      })
      .map((w) => [w.field, w.value]) ?? [];
  if (!indexEqFields?.length && !boundField && !args.sortBy) {
    return;
  }
  const indexes =
    schema.tables[args.model as keyof typeof schema.tables][" indexes"]();
  const sortField = args.sortBy?.field;

  // We internally use _creationTime in place of Better Auth's createdAt
  const indexFields = indexEqFields
    .map(([field]) => field)
    .concat(
      boundField && boundField !== "createdAt"
        ? `${indexEqFields.length ? "_" : ""}${boundField}`
        : ""
    )
    .concat(
      sortField && sortField !== "createdAt" && boundField !== sortField
        ? `${indexEqFields.length || boundField ? "_" : ""}${sortField}`
        : ""
    )
    .filter(Boolean);
  if (!indexFields.length && !boundField && !sortField) {
    return;
  }
  // Use the built in _creationTime index if bounding or sorting by createdAt
  // with no other fields
  const index = !indexFields.length
    ? {
        indexDescriptor: "by_creation_time",
        fields: [],
      }
    : indexes.find(({ fields }) => {
        const fieldsMatch = indexFields.every(
          (field, idx) => field === fields[idx]
        );
        // If sorting by createdAt, no intermediate fields can be on the index
        // as they may override the createdAt sort order.
        const boundFieldMatch =
          boundField === "createdAt" || sortField === "createdAt"
            ? indexFields.length === fields.length
            : true;
        return fieldsMatch && boundFieldMatch;
      });
  if (!index) {
    return { indexFields };
  }
  return {
    index: {
      indexDescriptor: index.indexDescriptor,
      fields: [...index.fields, "_creationTime"],
    },
    boundField,
    sortField,
    values: {
      eq: indexEqFields.map(([, value]) => value),
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

// Manually filter an individual document by where clauses. This is used to
// simplify queries that can only return 0 or 1 documents, or "in" clauses that
// query multiple single documents in parallel.
const filterByWhere = (
  doc: Doc<any>,
  where?: Infer<typeof adapterWhereValidator>[],
  filterWhere?: (w: Infer<typeof adapterWhereValidator>) => any
) => {
  if (!doc) {
    return false;
  }
  for (const w of where ?? []) {
    if (filterWhere && !filterWhere(w)) {
      continue;
    }
    const value = doc[w.field as keyof typeof doc] as Infer<
      typeof adapterWhereValidator
    >["value"];
    const isLessThan = (val: typeof value, wVal: typeof w.value) => {
      if (!wVal) {
        return false;
      }
      if (!val) {
        return true;
      }
      return val < wVal;
    };
    const isGreaterThan = (val: typeof value, wVal: typeof w.value) => {
      if (!val) {
        return false;
      }
      if (!wVal) {
        return true;
      }
      return val > wVal;
    };
    switch (w.operator) {
      case undefined:
      case "eq": {
        return value === w.value;
      }
      case "in": {
        return Array.isArray(w.value) && (w.value as any[]).includes(value);
      }
      case "lt": {
        return isLessThan(value, w.value);
      }
      case "lte": {
        return value === w.value || isLessThan(value, w.value);
      }
      case "gt": {
        return isGreaterThan(value, w.value);
      }
      case "gte": {
        return value === w.value || isGreaterThan(value, w.value);
      }
      case "ne": {
        return value !== w.value;
      }
      case "contains": {
        return typeof value === "string" && value.includes(w.value as string);
      }
      case "starts_with": {
        return typeof value === "string" && value.startsWith(w.value as string);
      }
      case "ends_with": {
        return typeof value === "string" && value.endsWith(w.value as string);
      }
    }
  }
  return true;
};

const generateQuery = (
  ctx: QueryCtx,
  args: Infer<typeof adapterArgsValidator>
) => {
  const { index, values, boundField, indexFields } = findIndex(args) ?? {};
  const query = stream(ctx.db, schema).query(args.model as any);
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
  const filteredQuery = orderedQuery.filterWith(async (doc) => {
    if (!index && indexFields?.length) {
      console.warn(
        stripIndent`
          Querying without an index on table "${args.model}".
          This can cause performance issues, and may hit the document read limit.
          To fix, add an index that begins with the following fields in order:
          [${indexFields.join(", ")}]
        `
      );
      return filterByWhere(doc, args.where);
    }
    return filterByWhere(
      doc,
      args.where,
      (w) =>
        w.operator &&
        ["contains", "starts_with", "ends_with", "ne"].includes(w.operator)
    );
  });
  return filteredQuery;
};

// This is the core function for reading from the database, it parses and
// validates where conditions, selects indexes, and allows the caller to
// optionally paginate as needed. Every response is a pagination result.
const paginate = async (
  ctx: QueryCtx,
  args: Infer<typeof adapterArgsValidator> & {
    paginationOpts: PaginationOptions;
  }
): Promise<PaginationResult<Doc<any>>> => {
  if (args.offset) {
    throw new Error(`offset not supported: ${JSON.stringify(args.offset)}`);
  }
  if (args.where?.some((w) => w.connector === "OR") && args.where?.length > 1) {
    throw new Error(
      `OR connector not supported with multiple where statements in paginate, split up the where statements before calling paginate: ${JSON.stringify(args.where)}`
    );
  }
  if (
    args.where?.some(
      (w) =>
        w.field === "id" && w.operator && !["eq", "in"].includes(w.operator)
    )
  ) {
    throw new Error(
      `id can only be used with eq or in operator: ${JSON.stringify(args.where)}`
    );
  }
  // If any where clause is "eq" (or missing operator) on a unique field,
  // we can only return a single document, so we get it and use any other
  // where clauses as static filters.
  const uniqueWhere = args.where?.find(
    (w) =>
      (!w.operator || w.operator === "eq") &&
      (isUniqueField(args.model as TableNames, w.field) || w.field === "id")
  );
  if (uniqueWhere) {
    const doc =
      uniqueWhere.field === "id"
        ? await ctx.db.get(uniqueWhere.value as Id<TableNames>)
        : await ctx.db
            .query(args.model as any)
            .withIndex(uniqueWhere.field as any, (q) =>
              q.eq(uniqueWhere.field, uniqueWhere.value)
            )
            .unique();

    if (filterByWhere(doc, args.where, (w) => w !== uniqueWhere)) {
      return {
        page: [selectFields(doc, args.select)].filter(Boolean),
        isDone: true,
        continueCursor: "",
      };
    }
    return {
      page: [],
      isDone: true,
      continueCursor: "",
    };
  }

  const paginationOpts = {
    ...args.paginationOpts,
    // If maximumRowsRead is not at least 1 higher than numItems, bad cursors
    // and incorrect paging will result (at least with convex-test).
    maximumRowsRead: Math.max((args.paginationOpts.numItems ?? 0) + 1, 200),
  };

  // Large queries using "in" clause will crash, but these are only currently
  // possible with the organization plugin listing all members with a high
  // limit. For cases like this we need to create proper convex queries in
  // the component as an alternative to using Better Auth api's.
  const inWhere = args.where?.find((w) => w.operator === "in");
  if (inWhere) {
    if (!Array.isArray(inWhere.value)) {
      throw new Error("in clause value must be an array");
    }
    // For ids, just use asyncMap + .get()
    if (inWhere.field === "id") {
      const docs = await asyncMap(inWhere.value as any[], async (value) => {
        return ctx.db.get(value as Id<TableNames>);
      });
      const filteredDocs = docs
        .flatMap((doc) => doc || [])
        .filter((doc) => filterByWhere(doc, args.where, (w) => w !== inWhere));

      return {
        page: filteredDocs.sort((a, b) => {
          if (args.sortBy?.field === "createdAt") {
            return args.sortBy.direction === "asc"
              ? a._creationTime - b._creationTime
              : b._creationTime - a._creationTime;
          }
          if (args.sortBy) {
            const aValue = a[args.sortBy.field as keyof typeof a];
            const bValue = b[args.sortBy.field as keyof typeof b];
            if (aValue === bValue) {
              return 0;
            }
            return args.sortBy.direction === "asc"
              ? aValue > bValue
                ? 1
                : -1
              : aValue > bValue
                ? -1
                : 1;
          }
          return 0;
        }),
        isDone: true,
        continueCursor: "",
      };
    }
    const streams = inWhere.value.map((value) => {
      return generateQuery(ctx, {
        ...args,
        where: args.where?.map((w) => {
          if (w === inWhere) {
            return { ...w, operator: "eq", value };
          }
          return w;
        }),
      });
    });
    const result = await mergedStream(
      streams,
      [
        args.sortBy?.field !== "createdAt" && args.sortBy?.field,
        "_creationTime",
      ].flatMap((f) => (f ? [f] : []))
    )
      .filterWith(async (doc) =>
        filterByWhere(
          doc,
          args.where,
          (w) =>
            w.operator &&
            ["contains", "starts_with", "ends_with", "ne"].includes(w.operator)
        )
      )
      .paginate(paginationOpts);
    return {
      ...result,
      page: result.page.map((doc) => selectFields(doc, args.select)),
    };
  }

  const query = generateQuery(ctx, args);
  const result = await query.paginate(paginationOpts);
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
      if (
        hasUniqueFields(
          args.input.model as TableNames,
          args.input.update ?? {}
        ) &&
        page.length > 1
      ) {
        throw new Error(
          `Attempted to set unique fields in multiple documents in ${args.input.model} with the same value. Fields: ${Object.keys(args.input.update ?? {}).join(", ")}`
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
