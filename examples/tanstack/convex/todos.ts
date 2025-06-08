import { v } from 'convex/values'
import { mutation, query, QueryCtx } from './_generated/server'
import { Id } from './_generated/dataModel'

const getUserId = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity()
  return (identity?.subject as Id<'users'>) ?? null
}

const requireUserId = async (ctx: QueryCtx) => {
  const userId = await getUserId(ctx)
  if (!userId) {
    throw new Error('Not authenticated')
  }
  return userId
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx)
    if (!userId) {
      return []
    }
    return await ctx.db
      .query('todos')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()
  },
})

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const now = Date.now()
    await ctx.db.insert('todos', {
      text: args.text,
      completed: false,
      userId,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const toggle = mutation({
  args: { id: v.id('todos') },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)

    const todo = await ctx.db.get(args.id)
    if (!todo || todo.userId !== userId) {
      throw new Error('Todo not found or unauthorized')
    }

    await ctx.db.patch(args.id, {
      completed: !todo.completed,
      updatedAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { id: v.id('todos') },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)

    const todo = await ctx.db.get(args.id)
    if (!todo || todo.userId !== userId) {
      throw new Error('Todo not found or unauthorized')
    }

    await ctx.db.delete(args.id)
  },
})
