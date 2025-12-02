import { ClientAuthCheck } from '@/lib/auth-client'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: () => {
    return (
      <ClientAuthCheck>
        <Outlet />
      </ClientAuthCheck>
    )
  },
})
