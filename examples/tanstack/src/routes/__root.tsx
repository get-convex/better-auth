/// <reference types="vite/client" />
import {
  Outlet,
  createRootRouteWithContext,
  useRouteContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient } from '@tanstack/react-query'
import * as React from 'react'
import appCss from '@/styles/app.css?url'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import { authClient } from '@/lib/auth-client'
import {
  getCookieNames,
  fetchAuth,
  getAuthFromCookie,
} from '@convex-dev/better-auth/react-start'
import { getCookie, getRequest } from '@tanstack/react-start/server'
import { seo } from '@/utils/seo'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { createServerFn } from '@tanstack/react-start'

const getAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const { createAuth } = await import('../../convex/auth')
  const cookieNames = getCookieNames(createAuth)
  const cookieAuth = getAuthFromCookie(getCookie(cookieNames.convexJwt))
  if (cookieAuth) {
    return cookieAuth
  }
  if (getCookie(cookieNames.sessionToken)) {
    return await fetchAuth(getRequest())
  }
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexQueryClient: ConvexQueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: 'Convex + Better Auth + TanStack Start',
        description: `Convex + Better Auth + TanStack Start`,
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  beforeLoad: async (ctx) => {
    const authData = await getAuth()

    // all queries, mutations and actions through TanStack Query will be
    // authenticated during SSR if we have a valid token
    if (authData?.token) {
      // During SSR only (the only time serverHttpClient exists),
      // set the auth token to make HTTP queries with.
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(authData.token)
    }

    return {
      userId: authData?.userId,
      token: authData?.token,
    }
  },
  component: RootComponent,
})

function RootComponent() {
  const context = useRouteContext({ from: Route.id })
  return (
    <ConvexBetterAuthProvider
      client={context.convexQueryClient.convexClient}
      authClient={authClient}
    >
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ConvexBetterAuthProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-neutral-950 text-neutral-50">
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
