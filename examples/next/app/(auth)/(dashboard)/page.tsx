import { Toaster } from "sonner";
import { api } from "@/convex/_generated/api";
import { TodoList } from "./todo-list";
import { Header } from "./header";
import { preloadQuery } from "@/lib/auth-server";

const Page = async () => {
  // Preload queries for SSR
  const preloadedUserQuery = await preloadQuery(api.auth.getCurrentUser);
  const preloadedTodosQuery = await preloadQuery(api.todos.get);

  return (
    <div className="min-h-screen w-full p-4 space-y-8">
      <Header preloadedUserQuery={preloadedUserQuery} />
      <TodoList preloadedTodosQuery={preloadedTodosQuery} />
      <Toaster />
    </div>
  );
};

export default Page;
