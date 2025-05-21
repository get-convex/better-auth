import { api } from "@/convex/_generated/api";
import { getToken } from "@convex-dev/better-auth/nextjs";
import { createAuth } from "@/convex/auth";
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
} from "@/app/ui/server";

export const TodoList = async () => {
  const token = await getToken(createAuth);
  const preloaded = await preloadQuery(api.todos.get, {}, { token });
  const todos = preloadedQueryResult(preloaded);

  // Authenticated inline server actions
  async function addTodo(formData: FormData) {
    "use server";
    await fetchMutation(
      api.todos.create,
      { text: formData.get("text") as string },
      // Outer token could expire, get a fresh one for the action
      { token: await getToken(createAuth) },
    );
  }

  const toggleCompletedAction = async (formData: FormData) => {
    "use server";
    await fetchMutation(
      api.todos.toggle,
      { id: formData.get("id") as Id<"todos"> },
      { token: await getToken(createAuth) },
    );
  };

  return (
    <TodoListContainer>
      <AddTodoForm action={addTodo} />
      <TodoItems
        preloadedTodos={preloaded}
        toggleCompletedAction={toggleCompletedAction}
      />

      {todos.length === 0 && <TodoEmptyState />}
    </TodoListContainer>
  );
};
