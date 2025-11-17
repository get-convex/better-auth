import { getToken } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  if (!(await getToken())) {
    redirect("/sign-in");
  }
  return <>{children}</>;
}
