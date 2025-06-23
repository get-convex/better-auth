import {
  action,
  mutation,
  query,
  QueryCtx,
} from "../component/_generated/server";
import { asyncMap } from "convex-helpers";
import { v } from "convex/values";
import { api } from "../component/_generated/api";
import { Doc, Id, TableNames } from "../component/_generated/dataModel";
import schema from "../component/schema";
import { paginationOptsValidator, PaginationResult } from "convex/server";
import { paginator } from "convex-helpers/server/pagination";
import { partial } from "convex-helpers/validators";

// Get the session via sessionId in jwt claims
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

export const getByHelper = async (
  ctx: QueryCtx,
  args: {
    table: string;
    field: string;
    value: any;
    unique?: boolean;
  }
) => {
  if (args.field === "id") {
    return ctx.db.get(args.value);
  }
  const query = ctx.db
    .query(args.table as any)
    .withIndex(args.field as any, (q) => q.eq(args.field, args.value));
  return args.unique ? await query.unique() : await query.first();
};

export const getByArgsValidator = {
  table: v.string(),
  field: v.string(),
  unique: v.optional(v.boolean()),
  value: v.union(
    v.string(),
    v.number(),
    v.boolean(),
    v.array(v.string()),
    v.array(v.number()),
    v.null()
  ),
};

// Generic functions
export const getByQuery = query({
  args: getByArgsValidator,
  handler: async (ctx, args) => {
    const doc = await getByHelper(ctx, args);
    if (!doc) {
      return;
    }
    return doc;
  },
});
export { getByQuery as getBy };

export const create = mutation({
  args: v.object({
    input: v.union(
      ...Object.values(schema.tables).map((table) =>
        v.object({
          table: v.string(),
          ...table.validator.fields,
        })
      )
    ),
  }),
  handler: async (ctx, args) => {
    const { table, ...input } = args.input;
    const id = await ctx.db.insert(table as any, {
      ...input,
    });
    const doc = await ctx.db.get(id);
    if (!doc) {
      throw new Error(`Failed to create ${table}`);
    }
    return doc;
  },
});

export const updateArgsInputValidator = <T extends TableNames>(table: T) => {
  return v.object({
    table: v.literal(table),
    where: v.object({ field: v.string(), value: getByArgsValidator.value }),
    value: v.record(v.string(), v.any()),
  });
};

const updateArgsValidator = {
  input: v.union(
    updateArgsInputValidator("account"),
    updateArgsInputValidator("session"),
    updateArgsInputValidator("verification"),
    updateArgsInputValidator("user")
  ),
};

export const update = mutation({
  args: updateArgsValidator,
  handler: async (ctx, args) => {
    const { table, where, value } = args.input;
    const doc =
      where.field === "id"
        ? await ctx.db.get(where.value as Id<any>)
        : await getByHelper(ctx, { table, ...where });
    if (!doc) {
      throw new Error(`Failed to update ${table}`);
    }
    await ctx.db.patch(doc._id, value as any);
    const updatedDoc = await ctx.db.get(doc._id);
    if (!updatedDoc) {
      throw new Error(`Failed to update ${table}`);
    }
    return updatedDoc;
  },
});

export const deleteBy = mutation({
  args: getByArgsValidator,
  handler: async (ctx, args) => {
    const doc = await getByHelper(ctx, args);
    if (!doc) {
      return;
    }
    await ctx.db.delete(doc._id);
    // onDeleteUser requires userId from the doc,
    // so just return the whole thing
    return doc;
  },
});

export const listBy = query({
  args: {
    input: v.union(
      v.object({
        table: v.literal("account"),
        field: v.union(v.literal("accountId"), v.literal("userId")),
        value: v.string(),
        limit: v.optional(v.number()),
      }),
      v.object({
        table: v.literal("session"),
        field: v.literal("userId"),
        value: v.string(),
        limit: v.optional(v.number()),
      }),
      v.object({
        table: v.literal("rateLimit"),
        field: v.literal("key"),
        value: v.string(),
        limit: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { table, field, value, limit } = args.input;
    const query = ctx.db
      .query(table)
      .withIndex(field as any, (q) => q.eq(field, value));
    return limit ? await query.take(limit) : await query.collect();
  },
});

// Single purpose functions
export const getJwks = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db.query("jwks");
    const docs = args.limit
      ? await query.take(args.limit)
      : await query.collect();
    return docs;
  },
});

export const listVerificationsByIdentifier = query({
  args: {
    identifier: v.string(),
    sortBy: v.optional(
      v.object({
        field: v.string(),
        direction: v.union(v.literal("asc"), v.literal("desc")),
      })
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.sortBy && args.sortBy.field !== "createdAt") {
      throw new Error(`Unsupported sortBy field: ${args.sortBy.field}`);
    }
    const query = ctx.db
      .query("verification")
      .withIndex("identifier", (q) => q.eq("identifier", args.identifier))
      .order(
        args.sortBy?.field === "createdAt" && args.sortBy?.direction
          ? args.sortBy.direction
          : "asc"
      );
    const docs = args.limit
      ? await query.take(args.limit)
      : await query.collect();
    return docs;
  },
});

export const getIn = query({
  args: {
    input: v.union(
      v.object({
        table: v.literal("session"),
        field: v.literal("token"),
        values: v.array(v.string()),
      }),
      v.object({
        table: v.literal("user"),
        field: v.literal("userId"),
        values: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { table, field, values } = args.input;
    return asyncMap(values, async (value) =>
      ctx.db
        .query(table)
        .withIndex(field as any, (q) => q.eq(field, value))
        .unique()
    );
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

export const deleteOldVerificationsPage = mutation({
  args: {
    currentTimestamp: v.number(),
    paginationOpts: v.optional(paginationOptsValidator),
  },
  handler: async (ctx, args) => {
    const paginationOpts = args.paginationOpts ?? {
      numItems: 500,
      cursor: null,
    };
    const { page, ...result } = await paginator(ctx.db, schema)
      .query("verification")
      .withIndex("expiresAt", (q) => q.lt("expiresAt", args.currentTimestamp))
      .paginate(paginationOpts);
    await asyncMap(page, async (doc) => {
      await ctx.db.delete(doc._id);
    });
    return { ...result, count: page.length };
  },
});

export const deleteOldVerifications = action({
  args: {
    currentTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    let count = 0;
    let cursor = null;
    let isDone = false;
    do {
      const result: Omit<PaginationResult<Doc<"verification">>, "page"> & {
        count: number;
      } = await ctx.runMutation(api.lib.deleteOldVerificationsPage, {
        currentTimestamp: args.currentTimestamp,
        paginationOpts: {
          numItems: 500,
          cursor,
        },
      });
      count += result.count;
      cursor =
        result.pageStatus &&
        result.splitCursor &&
        ["SplitRecommended", "SplitRequired"].includes(result.pageStatus)
          ? result.splitCursor
          : result.continueCursor;
      isDone = result.isDone;
    } while (!isDone);
    return count;
  },
});

export const deleteExpiredSessions = mutation({
  args: {
    userId: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("session")
      .withIndex("expiresAt_userId", (q) =>
        q.eq("expiresAt", args.expiresAt).eq("userId", args.userId)
      )
      .collect();
    await asyncMap(docs, async (doc) => {
      await ctx.db.delete(doc._id);
    });
    return docs.length;
  },
});

export const deleteAllForUserPage = mutation({
  args: {
    table: v.string(),
    userId: v.string(),
    paginationOpts: v.optional(paginationOptsValidator),
  },
  handler: async (ctx, args) => {
    const paginationOpts = args.paginationOpts ?? {
      numItems: 500,
      cursor: null,
    };
    const { page, ...result } = await paginator(ctx.db, schema)
      .query(args.table as any)
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .paginate(paginationOpts);
    await asyncMap(page, async (doc) => {
      await ctx.db.delete(doc._id);
    });
    return { ...result, count: page.length };
  },
});

export const deleteAllForUser = action({
  args: {
    table: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    let count = 0;
    let cursor = null;
    let isDone = false;
    do {
      const result: Omit<PaginationResult<Doc<"session">>, "page"> & {
        count: number;
      } = await ctx.runMutation(api.lib.deleteAllForUserPage, {
        table: args.table,
        userId: args.userId,
        paginationOpts: {
          numItems: 500,
          cursor,
        },
      });
      count += result.count;
      cursor =
        result.pageStatus &&
        result.splitCursor &&
        ["SplitRecommended", "SplitRequired"].includes(result.pageStatus)
          ? result.splitCursor
          : result.continueCursor;
      isDone = result.isDone;
    } while (!isDone);
    return count;
  },
});

export const getAccountByAccountIdAndProviderId = query({
  args: { accountId: v.string(), providerId: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("account")
      .withIndex("accountId_providerId", (q) =>
        q.eq("accountId", args.accountId).eq("providerId", args.providerId)
      )
      .unique();
    if (!doc) {
      return;
    }
    return doc;
  },
});

export const updateUserProviderAccounts = mutation({
  args: {
    userId: v.string(),
    providerId: v.string(),
    update: v.object(partial(schema.tables.account.validator.fields)),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("account")
      .withIndex("providerId_userId", (q) =>
        q.eq("providerId", args.providerId).eq("userId", args.userId)
      )
      .collect();
    if (docs.length === 0) {
      return 0;
    }
    await asyncMap(docs, async (doc) => {
      await ctx.db.patch(doc._id, args.update);
    });
    return docs.length;
  },
});

export const updateMany = mutation({
  args: {
    input: v.union(
      v.object({
        table: v.literal("rateLimit"),
        field: v.literal("key"),
        update: v.object(partial(schema.tables.rateLimit.validator.fields)),
      }),
      v.object({
        table: v.literal("twoFactor"),
        field: v.literal("userId"),
        update: v.object(partial(schema.tables.twoFactor.validator.fields)),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { table, field, update } = args.input;
    const docs = await ctx.db
      .query(table)
      .withIndex(field as any, (q) =>
        q.eq(field, update[field as keyof typeof update])
      )
      .collect();
    if (docs.length === 0) {
      return 0;
    }
    await asyncMap(docs, async (doc) => {
      await ctx.db.patch(doc._id, update);
    });
    return docs.length;
  },
});
