import {
  sendEmailVerification,
  sendMagicLink,
  sendOTPVerification,
  sendResetPassword,
} from '../../convex/email'
import { GenericCtx } from '../../convex/_generated/server'
import { betterAuthComponent } from '../../convex/auth'
import { betterAuth } from 'better-auth'
import { convexAdapter } from '@convex-dev/better-auth'
import { convex } from '@convex-dev/better-auth/plugins'
import { emailOTP, magicLink, twoFactor } from 'better-auth/plugins'

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
        await sendEmailVerification({
          to: user.email,
          url,
        })
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        await sendResetPassword({
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
          await sendMagicLink({
            to: email,
            url,
          })
        },
      }),
      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          await sendOTPVerification({
            to: email,
            code: otp,
          })
        },
      }),
      twoFactor(),
      convex(),
    ],
  })
