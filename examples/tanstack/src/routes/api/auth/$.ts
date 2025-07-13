import { createServerFileRoute } from '@tanstack/react-start/server'
import { reactStartHandler } from '@/lib/utils'

export const ServerRoute = createServerFileRoute('/api/auth/$').methods({
  GET: ({ request }) => {
    return reactStartHandler(request)
  },
  POST: ({ request }) => {
    return reactStartHandler(request)
  },
})
