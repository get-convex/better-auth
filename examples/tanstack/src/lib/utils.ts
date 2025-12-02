import { clsx, type ClassValue } from 'clsx'
import { ConvexError } from 'convex/values'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isAuthError(error: unknown) {
  return Boolean(
    // Uncaught errors that are not Convex errors, retry just in case
    !(error instanceof Error) ||
      // Match Convex errors that include 'auth' or 'user' in the error message
      (error instanceof ConvexError &&
        typeof error.data === 'string' &&
        error.data.match(/auth|user/i)),
  )
}
