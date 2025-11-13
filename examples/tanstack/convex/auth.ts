import { betterAuth } from 'better-auth'
import {
  AuthFunctions,
  createClient,
  GenericCtx,
} from '@convex-dev/better-auth'
import { anonymous, emailOTP, magicLink, twoFactor } from 'better-auth/plugins'
import { convex } from '@convex-dev/better-auth/plugins'
import {
  sendEmailVerification,
  sendMagicLink,
  sendOTPVerification,
  sendResetPassword,
} from './email'
import { requireActionCtx } from '@convex-dev/better-auth/utils'
import { components, internal } from './_generated/api'
import betterAuthSchema from './betterAuth/schema'
import { query, QueryCtx } from './_generated/server'
import { DataModel, Id } from './_generated/dataModel'
import { asyncMap, withoutSystemFields } from 'convex-helpers'

// This implementation is upgraded to 0.8 Local Install with no
// database migration required. It continues the pattern of writing
// userId to the Better Auth users table and maintaining a separate
// users table for application data.

const siteUrl = process.env.SITE_URL

const authFunctions: AuthFunctions = internal.auth

export const authComponent = createClient<DataModel, typeof betterAuthSchema>(
  components.betterAuth,
  {
    authFunctions,
    local: {
      schema: betterAuthSchema,
    },
    verbose: true,
    triggers: {
      user: {
        onCreate: async (ctx, authUser) => {
          const userId = await ctx.db.insert('users', {
            email: authUser.email,
          })
          await authComponent.setUserId(ctx, authUser._id, userId)
        },
        onUpdate: async (ctx, newUser, oldUser) => {
          if (oldUser.email === newUser.email) {
            return
          }
          await ctx.db.patch(newUser.userId as Id<'users'>, {
            email: newUser.email,
          })
        },
        onDelete: async (ctx, authUser) => {
          const user = await ctx.db.get(authUser.userId as Id<'users'>)
          if (!user) {
            return
          }
          const todos = await ctx.db
            .query('todos')
            .withIndex('userId', (q) => q.eq('userId', user._id))
            .collect()
          await asyncMap(todos, async (todo) => {
            await ctx.db.delete(todo._id)
          })
          await ctx.db.delete(user._id)
        },
      },
    },
  },
)

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi()

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false },
) =>
  betterAuth({
    baseURL: siteUrl,
    logger: {
      disabled: optionsOnly,
    },
    database: authComponent.adapter(ctx),
    account: {
      accountLinking: {
        enabled: true,
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmailVerification(requireActionCtx(ctx), {
          to: user.email,
          url,
        })
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        await sendResetPassword(requireActionCtx(ctx), {
          to: user.email,
          url,
        })
      },
    },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
      additionalFields: {
        foo: {
          type: 'string',
          required: false,
        },
      },
    },
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLink(requireActionCtx(ctx), {
            to: email,
            url,
          })
        },
      }),
      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          await sendOTPVerification(requireActionCtx(ctx), {
            to: email,
            code: otp,
          })
        },
      }),
      twoFactor(),
      anonymous(),
      convex(),
    ],
  })

// Below are example functions for getting the current user
// Feel free to edit, omit, etc.
export const safeGetUser = async (ctx: QueryCtx) => {
  const authUser = await authComponent.safeGetAuthUser(ctx)
  if (!authUser) {
    return
  }
  const user = await ctx.db.get(authUser.userId as Id<'users'>)
  if (!user) {
    return
  }
  return { ...user, ...withoutSystemFields(authUser) }
}

export const getUser = async (ctx: QueryCtx) => {
  const user = await safeGetUser(ctx)
  if (!user) {
    throw new Error('User not found')
  }
  return user
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await safeGetUser(ctx)
  },
})
