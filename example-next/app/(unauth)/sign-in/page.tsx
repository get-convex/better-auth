"use client";

import SignIn from "@/app/(unauth)/sign-in/SignIn";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignIn />
        <p className="text-center mt-4 text-sm text-neutral-600 dark:text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200 underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
