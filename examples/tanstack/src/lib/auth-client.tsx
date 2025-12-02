import {
  twoFactorClient,
  magicLinkClient,
  emailOTPClient,
  anonymousClient,
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { convexClient } from '@convex-dev/better-auth/client/plugins'
import { AuthCheck } from '@convex-dev/better-auth/react'
import { PropsWithChildren } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@convex/_generated/api'
import { isAuthError } from '@/lib/utils'

export const authClient = createAuthClient({
  plugins: [
    magicLinkClient(),
    emailOTPClient(),
    twoFactorClient(),
    anonymousClient(),
    convexClient(),
  ],
})

export const ClientAuthCheck = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate()
  return (
    <AuthCheck
      authClient={authClient}
      onUnauth={() => navigate({ to: '/sign-in' })}
      getAuthUserFn={api.auth.authCheck}
      isAuthError={isAuthError}
    >
      <>{children}</>
    </AuthCheck>
  )
}
