"use client";

import { api } from "@/convex/_generated/api";
import { Preloaded, useConvexAuth, usePreloadedQuery } from "convex/react";
import {
  TodoList,
  TodoRemoveButton,
  TodoText,
  TodoCompleteButton,
  TodoItem,
} from "@/components/server";
import { removeTodo } from "./actions";
import { useEffect, useState } from "react";

export const TodoItems = ({
  preloadedTodosQuery,
  toggleCompletedAction,
}: {
  preloadedTodosQuery: Preloaded<typeof api.todos.get>;
  toggleCompletedAction: (formData: FormData) => Promise<void>;
}) => {
  const { isLoading } = useConvexAuth();
  const preloadedTodos = usePreloadedQuery(preloadedTodosQuery);
  const [todos, setTodos] = useState(preloadedTodos);

  useEffect(() => {
    if (!isLoading) {
      setTodos(preloadedTodos);
    }
  }, [preloadedTodos, isLoading]);

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
