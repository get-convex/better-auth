"use client";

import { api } from "@/convex/_generated/api";
import { Preloaded } from "convex/react";
import { usePreloadedQuery } from "@convex-dev/better-auth/nextjs/client";
import { useToggleCompleted, useRemoveTodo } from "./mutations";
import { TodoItem } from "./todo-item";
import { TodoForm } from "./todo-form";

export const TodoList = ({
  preloadedTodosQuery,
}: {
  preloadedTodosQuery: Preloaded<typeof api.todos.get>;
}) => {
  const toggleCompleted = useToggleCompleted();
  const removeTodo = useRemoveTodo();
  const todos = usePreloadedQuery(preloadedTodosQuery);

  return (
    <main>
      <div className="max-w-2xl mx-auto space-y-6">
        <TodoForm />

        <ul className="space-y-3">
          {todos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onToggleCompleted={toggleCompleted}
              onRemove={removeTodo}
            />
          ))}
        </ul>

        {todos.length === 0 && (
          <p className="text-center text-neutral-500 py-8">
            No todos yet. Add one above!
          </p>
        )}
      </div>
    </main>
  );
};
