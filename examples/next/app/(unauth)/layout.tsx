import { api } from "@/convex/_generated/api";
import { getToken } from "@/lib/auth-server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  const isAuthenticated = await fetchQuery(
    api.auth.isAuthenticated,
    {},
    { token: await getToken() },
  );
  if (isAuthenticated) {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
