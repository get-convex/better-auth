"use client";

import { authClient } from "@/lib/auth-client";
import { Preloaded, useConvexAuth, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignOutButton } from "@/components/client";
import { UserProfile as UserProfileComponent } from "@/components/server";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function SignOut() {
  const router = useRouter();
  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };
  return <SignOutButton onClick={handleSignOut} />;
}

export const UserProfile = ({
  preloadedUserQuery,
}: {
  preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
}) => {
  const { isLoading } = useConvexAuth();
  const user = usePreloadedQuery(preloadedUserQuery);
  const [currentUser, setCurrentUser] = useState(user);
  useEffect(() => {
    if (!isLoading) {
      setCurrentUser(user);
    }
  }, [user, isLoading]);
  return (
    <>
      <UserProfileComponent user={currentUser as any} />
    </>
  );
};
