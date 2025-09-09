import { createAuth } from 'convex/auth'
import { setupFetchClient } from '@convex-dev/better-auth/react-start'

// These helpers call Convex functions using a token from
// Better Auth's cookies, if available.
export const { fetchQuery, fetchMutation, fetchAction } =
  await setupFetchClient(createAuth)
