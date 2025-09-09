import { Toaster } from "sonner";
import Link from "next/link";
import {
  AppContainer,
  AppHeader,
  AppNav,
  SettingsButton,
  SettingsButtonContent,
} from "@/components/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { SignOut, UserProfile } from "./client";
import { TodoList } from "./todo-list";
import { ModeToggle } from "@/app/mode-toggle";
import { getToken } from "@/lib/auth-server";

const Header = async () => {
  const token = await getToken();

  // Preload query for SSR
  const preloadedUserQuery = await preloadQuery(
    api.auth.getCurrentUser,
    {},
    { token },
  );

  return (
    <AppHeader>
      <UserProfile preloadedUserQuery={preloadedUserQuery} />
      <AppNav>
        <SettingsButton>
          <Link href="/settings">
            <SettingsButtonContent />
          </Link>
        </SettingsButton>
        <SignOut />
      </AppNav>
    </AppHeader>
  );
};

const ServerPage = async () => {
  return (
    <AppContainer>
      <ModeToggle />
      <Header />
      <TodoList />
      <Toaster />
    </AppContainer>
  );
};

export default ServerPage;
