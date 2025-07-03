import { createServerFileRoute } from '@tanstack/react-start/server'
import { reactStartHandler } from '@convex-dev/better-auth/react-start'

export const ServerRoute = createServerFileRoute('/api/auth/$').methods({
  GET: ({ request }) => {
    return reactStartHandler(request)
  },
  POST: ({ request }) => {
    return reactStartHandler(request)
  },
})
