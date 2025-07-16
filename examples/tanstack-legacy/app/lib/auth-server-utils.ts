import { reactStartHelpers } from '@convex-dev/better-auth/react-start'
import { createAuth } from './auth'

export const { fetchSession, reactStartHandler, getCookieName } =
  reactStartHelpers(createAuth, {
    convexSiteUrl: import.meta.env.VITE_CONVEX_SITE_URL,
  })
