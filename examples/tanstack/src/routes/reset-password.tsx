'use client'

import { createFileRoute } from '@tanstack/react-router'
import ResetPassword from '@/components/ResetPassword'

export const Route = createFileRoute('/reset-password')({
  component: ResetPassword,
})
