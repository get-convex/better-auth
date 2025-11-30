import { ClientAuthCheck } from "@/app/(auth)/client-auth-check";
import { isAuthenticated } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  if (!(await isAuthenticated())) {
    redirect("/sign-in");
  }
  return (
    <ClientAuthCheck unauthRedirectTo="/sign-in">{children}</ClientAuthCheck>
  );
}
