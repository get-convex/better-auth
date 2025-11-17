import { Toaster } from "sonner";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { TodoList } from "./todo-list";
import { getToken } from "@/lib/auth-server";
import { Header } from "./header";

const Page = async () => {
  const token = await getToken();

  // Preload queries for SSR
  const preloadedUserQuery = await preloadQuery(
    api.auth.getCurrentUser,
    {},
    { token },
  );
  const preloadedTodosQuery = await preloadQuery(api.todos.get, {}, { token });

  return (
    <div className="min-h-screen w-full p-4 space-y-8">
      <Header preloadedUserQuery={preloadedUserQuery} />
      <TodoList preloadedTodosQuery={preloadedTodosQuery} />
      <Toaster />
    </div>
  );
};

export default Page;
