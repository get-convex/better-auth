import { createAuth } from '@/lib/auth'
import { reactStartHelpers } from '@convex-dev/better-auth/react-start'
import { getWebRequest } from '@tanstack/react-start/server'

export const { fetchSession, reactStartHandler, getCookieName } =
  reactStartHelpers(createAuth, {
    convexSiteUrl: import.meta.env.VITE_CONVEX_SITE_URL,
  })

export const getRequestToken = async () => {
  const request = getWebRequest()
  const sessionCookieName = await getCookieName()
  const cookieHeader = request.headers.get('cookie') || ''
  const token = cookieHeader
    .split('; ')
    .find((c) => c.startsWith(`__Secure-${sessionCookieName}=`))
    ?.split('=')[1]
  return token
}