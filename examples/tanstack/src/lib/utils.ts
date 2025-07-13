import { createAuth } from '@/lib/auth'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { reactStartHelpers } from '@convex-dev/better-auth/react-start'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const { fetchSession, reactStartHandler, getCookieName } =
  reactStartHelpers(createAuth, {
    convexSiteUrl: import.meta.env.VITE_CONVEX_SITE_URL,
  })
