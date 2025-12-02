import Settings from '@/components/Settings'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@convex/_generated/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/settings')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.auth.getCurrentUser, { caller: 'loader' }),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.auth.hasPassword, {}),
      ),
    ])
  },
})

function RouteComponent() {
  return <Settings />
}
