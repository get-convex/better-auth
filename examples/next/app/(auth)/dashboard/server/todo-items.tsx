"use client";

import { api } from "@/convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import {
  TodoList,
  TodoRemoveButton,
  TodoText,
  TodoCompleteButton,
  TodoItem,
} from "@/app/ui/server";
import { removeTodo } from "./actions";

export const TodoItems = ({
  preloadedTodos,
  toggleCompletedAction,
}: {
  preloadedTodos: Preloaded<typeof api.todos.get>;
  toggleCompletedAction: (formData: FormData) => Promise<void>;
}) => {
  const todos = usePreloadedQuery(preloadedTodos);

  return (
    <TodoList>
      {todos.map((todo) => (
        <TodoItem key={todo._id}>
          {/* Server action as a prop */}
          <form action={toggleCompletedAction}>
            <input type="hidden" name="id" value={todo._id} />
            <TodoCompleteButton completed={todo.completed} type="submit" />
          </form>

          <TodoText text={todo.text} completed={todo.completed} />

          {/* Server function imported */}
          <TodoRemoveButton onClick={() => removeTodo(todo._id)} />
        </TodoItem>
      ))}
    </TodoList>
  );
};
