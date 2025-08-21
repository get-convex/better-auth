import { betterAuth } from 'better-auth'
import {
  AuthFunctions,
  CreateAdapter,
  createClient,
  getInactiveAuthInstance,
  RunCtx,
} from '@convex-dev/better-auth'
import { emailOTP, magicLink, twoFactor } from 'better-auth/plugins'
import { convex } from '@convex-dev/better-auth/plugins'
import {
  sendEmailVerification,
  sendMagicLink,
  sendOTPVerification,
  sendResetPassword,
} from './email'
import { requireMutationCtx } from '@convex-dev/better-auth/utils'
import { components, internal } from './_generated/api'
import betterAuthSchema from './betterAuth/schema'
import { query } from './_generated/server'
import { DataModel, Id } from './_generated/dataModel'
import { asyncMap } from 'convex-helpers'

const siteUrl = process.env.SITE_URL

export const createAuth = (ctx: RunCtx, createAdapter: CreateAdapter) =>
  betterAuth({
    baseURL: siteUrl,
    database: createAdapter(ctx),
    account: {
      accountLinking: {
        enabled: true,
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmailVerification(requireMutationCtx(ctx), {
          to: user.email,
          url,
        })
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        await sendResetPassword(requireMutationCtx(ctx), {
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
    },
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLink(requireMutationCtx(ctx), {
            to: email,
            url,
          })
        },
      }),
      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          await sendOTPVerification(requireMutationCtx(ctx), {
            to: email,
            code: otp,
          })
        },
      }),
      twoFactor(),
      convex(),
    ],
  })

export const auth = getInactiveAuthInstance(createAuth)

const authFunctions: AuthFunctions = internal.auth

export const betterAuthComponent = createClient<DataModel>(
  components.betterAuth.adapter,
  createAuth,
  {
    authFunctions,
    local: {
      schema: betterAuthSchema,
    },
    verbose: false,
    triggers: {
      user: {
        onCreate: async (ctx, user) => {
          await ctx.db.insert('users', {
            email: user.email,
          })
        },
        onUpdate: async (ctx, oldUser, newUser) => {
          await ctx.db.patch(oldUser.userId as Id<'users'>, {
            email: newUser.email,
          })
        },
        onDelete: async (ctx, userId) => {
          const todos = await ctx.db
            .query('todos')
            .withIndex('userId', (q) => q.eq('userId', userId as Id<'users'>))
            .collect()
          await asyncMap(todos, async (todo) => {
            await ctx.db.delete(todo._id)
          })
          await ctx.db.delete(userId as Id<'users'>)
        },
      },
    },
  },
)

export const { onCreate, onUpdate, onDelete } =
  betterAuthComponent.triggersApi()

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get user data from Better Auth - email, name, image, etc.
    const userMetadata = await betterAuthComponent.getAuthUser(ctx)
    if (!userMetadata) {
      return null
    }
    // Get user data from your application's database (skip this if you have no
    // fields in your users table schema)
    const user = await ctx.db.get(userMetadata.userId as Id<'users'>)
    return {
      ...user,
      ...userMetadata,
    }
  },
})
