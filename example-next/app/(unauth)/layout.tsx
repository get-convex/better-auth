"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log(
        `isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}, redirecting to /dashboard`,
      );
      redirect("/dashboard");
    }
  }, [isLoading, isAuthenticated]);

  return <div>{children}</div>;
};

export default AuthLayout;
