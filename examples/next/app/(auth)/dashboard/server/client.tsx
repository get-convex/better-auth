"use client";

import { authClient } from "@/lib/auth-client";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignOutButton } from "@/components/client";
import { UserProfile as UserProfileComponent } from "@/components/server";
import { useRouter } from "next/navigation";

export function SignOut() {
  const router = useRouter();
  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };
  return <SignOutButton onClick={handleSignOut} />;
}

export const UserProfile = ({
  preloadedUser,
}: {
  preloadedUser: Preloaded<typeof api.example.getCurrentUser>;
}) => {
  const user = usePreloadedQuery(preloadedUser);
  return (
    <>
      <UserProfileComponent user={user} />
    </>
  );
};
