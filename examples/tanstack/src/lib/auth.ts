import { betterAuth } from 'better-auth'
import { convexAdapter } from '@convex-dev/better-auth'
import { emailOTP, magicLink, twoFactor } from 'better-auth/plugins'
import { convex } from '@convex-dev/better-auth/plugins'
import {
  sendEmailVerification,
  sendMagicLink,
  sendOTPVerification,
  sendResetPassword,
} from '../../convex/email'
import { betterAuthComponent } from '../../convex/auth'
import type { GenericCtx } from '../../convex/_generated/server'
import { requireMutationCtx } from '@convex-dev/better-auth/utils'

export const createAuth = (ctx: GenericCtx) =>
  betterAuth({
    baseURL: process.env.SITE_URL,
    database: convexAdapter(ctx, betterAuthComponent),
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
