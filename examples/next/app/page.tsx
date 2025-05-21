"use client";

import { redirect } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  useEffect(() => {
    if (isAuthenticated) {
      redirect("/dashboard/client-only");
    } else {
      redirect("/sign-in");
    }
  }, [isAuthenticated, isLoading]);
  return null;
}
