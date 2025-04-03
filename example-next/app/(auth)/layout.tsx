"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log(
        `isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}, redirecting to /sign-in`,
      );
      redirect("/sign-in");
    }
  }, [isLoading, isAuthenticated]);

  return <div>{children}</div>;
};

export default AuthLayout;
