import { createAPIFileRoute } from '@tanstack/react-start/api'
import { reactStartHandler } from '@/lib/auth-server-utils'

export const APIRoute = createAPIFileRoute('/api/auth/$')({
  GET: ({ request }) => {
    return reactStartHandler(request)
  },
  POST: ({ request }) => {
    return reactStartHandler(request)
  },
})
