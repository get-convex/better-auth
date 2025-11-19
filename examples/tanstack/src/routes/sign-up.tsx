'use client'

import { createFileRoute, redirect } from '@tanstack/react-router'
import SignUp from '@/components/SignUp'

export const Route = createFileRoute('/sign-up')({
  component: SignUp,
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
})
