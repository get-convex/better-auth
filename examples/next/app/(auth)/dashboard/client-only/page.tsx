"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Toaster } from "sonner";
import { ModeToggle } from "@/app/mode-toggle";
import {
  AppContainer,
  AppHeader,
  AppNav,
  SettingsButton,
  SettingsButtonContent,
  UserProfile,
} from "@/components/server";
import { TodoList } from "./todo-list";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { SignOutButton } from "@/components/client";

const Header = () => {
  const router = useRouter();
  const user = useQuery(api.auth.getCurrentUser);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  return (
    <AppHeader>
      <UserProfile user={user} />
      <AppNav>
        <SettingsButton>
          <Link href="/settings">
            <SettingsButtonContent />
          </Link>
        </SettingsButton>
        <SignOutButton onClick={handleSignOut} />
      </AppNav>
    </AppHeader>
  );
};

export default function AppPage() {
  return (
    <AppContainer>
      <ModeToggle />
      <Header />
      <TodoList />
      <Toaster />
    </AppContainer>
  );
}
