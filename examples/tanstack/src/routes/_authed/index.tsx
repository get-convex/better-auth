import { TodoList } from '@/components/TodoList'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { UserProfile } from '@/components/UserProfile'
import { SignOutButton } from '@/components/client'
import { api } from '@convex/_generated/api'
import { convexQuery, useConvexAuth } from '@convex-dev/react-query'
import { authClient } from '@/lib/auth-client'
import { useAuthQuery } from '@convex-dev/better-auth/react-start/client'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/_authed/')({
  component: App,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.auth.getCurrentUser, {}),
      ),
      context.queryClient.ensureQueryData(convexQuery(api.todos.get, {})),
    ])
  },
})

function App() {
  const user = useQuery({
    ...convexQuery(api.auth.getCurrentUser, {}),
  })
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await authClient.signOut()
    void navigate({ to: '/sign-in' })
  }

  return (
    <div className="min-h-screen w-full p-4 space-y-8">
      <header className="flex items-center justify-between max-w-2xl mx-auto">
        <UserProfile user={user.data} />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/settings">
              <div className="flex items-center gap-2">
                <Settings size={16} />
                Settings
              </div>
            </Link>
          </Button>
          <SignOutButton onClick={handleSignOut} />
        </div>
      </header>
      <TodoList />
      <Toaster />
    </div>
  )
}
