import { createAuth } from '../../convex/auth'
import { reactStartHelpers } from '@convex-dev/better-auth/react-start'

export const { fetchSession, reactStartHandler, getCookieName } =
  reactStartHelpers(createAuth, {
    convexSiteUrl: import.meta.env.VITE_CONVEX_SITE_URL,
  })
