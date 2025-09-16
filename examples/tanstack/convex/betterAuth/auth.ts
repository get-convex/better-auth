import { createAuth } from '../auth'
import { getStaticAuth } from '@convex-dev/better-auth'

// Export a static instance for Better Auth schema generation
export const auth = getStaticAuth(createAuth)
