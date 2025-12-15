import { isAuthenticated } from "@/lib/auth-server";
import { ClientAuthBoundary } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  if (!(await isAuthenticated())) {
    redirect("/sign-in");
  }
  return <ClientAuthBoundary>{children}</ClientAuthBoundary>;
}
