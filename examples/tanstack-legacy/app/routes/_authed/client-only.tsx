'use client'

import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from '@convex/_generated/api'
import { ModeToggle } from '@/components/mode-toggle'
import {
  AppContainer,
  AppHeader,
  AppNav,
  SettingsButton,
  UserProfile,
} from '@/components/server'
import { authClient } from '@/lib/auth-client'
import { SignOutButton } from '@/components/client'
import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { useTransition } from 'react'

export const Route = createFileRoute('/_authed/client-only')({
  component: ClientOnlyComponent,
})

function ClientOnlyComponent() {
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  return (
    <AppContainer>
      <ModeToggle
        isServer={false}
        onSwitch={() => {
          startTransition(() => {
            void navigate({
              to: '/server',
            })
          })
        }}
        isPending={isPending}
      />
      <Header />
      <Outlet />
    </AppContainer>
  )
}

function Header() {
  const user = useQuery(convexQuery(api.auth.getCurrentUser, {}))
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
