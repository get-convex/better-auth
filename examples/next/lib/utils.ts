import { clsx, type ClassValue } from "clsx";
import { ConvexError } from "convex/values";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isAuthError = (error: unknown) => {
  return error instanceof ConvexError && error.data === "Unauthenticated";
};
