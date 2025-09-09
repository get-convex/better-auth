import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getUser, safeGetUser } from './auth'

export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await safeGetUser(ctx)
    if (!user) {
      return []
    }
    return await ctx.db
      .query('todos')
      .withIndex('userId', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect()
  },
})

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    const now = Date.now()
    await ctx.db.insert('todos', {
      text: args.text,
      completed: false,
      userId: user._id,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const toggle = mutation({
  args: { id: v.id('todos') },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)

    const todo = await ctx.db.get(args.id)
    if (!todo || todo.userId !== user._id) {
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
    const user = await getUser(ctx)

    const todo = await ctx.db.get(args.id)
    if (!todo || todo.userId !== user._id) {
      throw new Error('Todo not found or unauthorized')
    }

    await ctx.db.delete(args.id)
  },
})
