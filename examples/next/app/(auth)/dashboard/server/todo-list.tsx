import { api } from "@/convex/_generated/api";
import {
  fetchMutation,
  preloadedQueryResult,
  preloadQuery,
} from "convex/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { TodoItems } from "@/app/(auth)/dashboard/server/todo-items";
import {
  AddTodoForm,
  TodoListContainer,
  TodoEmptyState,
} from "@/components/server";
import { getToken } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export const TodoList = async () => {
  console.log("TodoList");
  const token = await getToken();
  console.log("token TodoList", token);
  if (!token) {
    redirect("/sign-in");
  }
  const preloadedTodosQuery = await preloadQuery(api.todos.get, {}, { token });
  const todos = preloadedQueryResult(preloadedTodosQuery);

  // Authenticated inline server actions
  async function addTodo(formData: FormData) {
    "use server";
    const token = await getToken();
    await fetchMutation(
      api.todos.create,
      { text: formData.get("text") as string },
      // Outer token could expire, get a fresh one for the action
      { token },
    );
  }

  const toggleCompletedAction = async (formData: FormData) => {
    "use server";
    const token = await getToken();
    console.log("token toggleCompletedAction", token);
    await fetchMutation(
      api.todos.toggle,
      { id: formData.get("id") as Id<"todos"> },
      { token },
    );
  };

  return (
    <TodoListContainer>
      <AddTodoForm action={addTodo} />
      <TodoItems
        preloadedTodosQuery={preloadedTodosQuery}
        toggleCompletedAction={toggleCompletedAction}
      />

      {todos.length === 0 && <TodoEmptyState />}
    </TodoListContainer>
  );
};
