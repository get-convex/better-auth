import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import {
  AppContainer,
  AppHeader,
  AppNav,
  SettingsButton,
  UserProfile,
} from '@/components/server'
import { SignOutButton } from '@/components/client'
import { api } from '@convex/_generated/api'
import { TodoList } from '@/components/TodoListServer'
import { ModeToggle } from '@/components/mode-toggle'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { useTransition } from 'react'

export const Route = createFileRoute('/_authed/server')({
  component: ServerComponent,
})

function ServerComponent() {
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()

  return (
    <AppContainer>
      <ModeToggle
        isServer={true}
        onSwitch={() => {
          startTransition(() => {
            void navigate({ to: '/client-only' })
          })
        }}
        isPending={isPending}
      />
      <Header />
      <TodoList />
      <Toaster />
    </AppContainer>
  )
}

function Header() {
  const user = useSuspenseQuery(convexQuery(api.auth.getCurrentUser, {}))
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await authClient.signOut()
    void navigate({ to: '/sign-in' })
  }

  return (
    <AppHeader>
      <UserProfile user={user.data} />
      <AppNav>
        <SettingsButton>
          {/*
          <Link to="/settings">
            <SettingsButtonContent />
          </Link>
          */}
        </SettingsButton>
        <SignOutButton onClick={handleSignOut} />
      </AppNav>
    </AppHeader>
  )
}
