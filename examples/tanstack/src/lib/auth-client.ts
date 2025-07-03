import {
  twoFactorClient,
  magicLinkClient,
  emailOTPClient,
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { convexClient } from '@convex-dev/better-auth/client/plugins'
import { reactStartHelpers } from '@convex-dev/better-auth/react-start'
import { createAuth } from '@convex/auth'

export const authClient = createAuthClient({
  plugins: [
    magicLinkClient(),
    emailOTPClient(),
    twoFactorClient(),
    convexClient(),
  ],
})

export const { fetchSession, reactStartHandler, getCookieName } =
  reactStartHelpers(createAuth, {
    convexSiteUrl: import.meta.env.VITE_CONVEX_SITE_URL,
  })
