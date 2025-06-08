'use client'

import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignIn } from '@/components/SignIn'

export const Route = createFileRoute('/sign-in')({
  component: SignIn,
  beforeLoad: ({ context }) => {
    if (context.userId) {
      throw redirect({ to: '/client-only' })
    }
  },
})
