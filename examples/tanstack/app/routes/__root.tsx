import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
  useRouteContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Meta, Scripts, createServerFn } from '@tanstack/react-start'
import { QueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { getWebRequest } from 'vinxi/http'
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary.js'
import { NotFound } from '@/components/NotFound.js'
import appCss from '@/styles/app.css?url'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { ConvexReactClient } from 'convex/react'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import { getToken } from '@convex-dev/better-auth/react-start'

import { createAuth } from '@convex/auth'
import { betterFetch } from '@better-fetch/fetch'
import { authClient } from '@/lib/auth-client'

type Session = ReturnType<typeof createAuth>['$Infer']['Session']

const fetchAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const token = await getToken(createAuth)
  const request = getWebRequest()
  const baseURL = new URL(request.url).origin
  console.log('request.url', request.url)
  console.log('baseURL', baseURL)
  const { data: session } = await betterFetch<Session>(
    '/api/auth/get-session',
    {
      baseURL,
      headers: {
        cookie: request.headers.get('cookie') ?? '',
        origin: baseURL,
      },
    },
  )

  return {
    userId: session?.user.id,
    token,
  }
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexClient: ConvexReactClient
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
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  beforeLoad: async (ctx) => {
    const auth = await fetchAuth()
    const { userId, token } = auth

    // During SSR only (the only time serverHttpClient exists),
    // set the auth token to make HTTP queries with.
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
    }

    return {
      userId,
      token,
    }
  },
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  const context = useRouteContext({ from: Route.id })
  return (
    <ConvexBetterAuthProvider
      client={context.convexClient}
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
        <Meta />
      </head>
      <body className="bg-neutral-950 text-neutral-50">
        {children}
        <ScrollRestoration />
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
