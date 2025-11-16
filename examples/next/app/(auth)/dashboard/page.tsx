import { Toaster } from "sonner";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { TodoList } from "./todo-list";
import { getToken } from "@/lib/auth-server";
import { Header } from "./header";

const Page = async () => {
  const token = await getToken();

  // Preload query for SSR
  const preloadedUserQuery = await preloadQuery(
    api.auth.getCurrentUser,
    {},
    { token },
  );

  return (
    <div className="min-h-screen w-full p-4 space-y-8">
      <Header preloadedUserQuery={preloadedUserQuery} />
      <TodoList />
      <Toaster />
    </div>
  );
};

export default Page;
