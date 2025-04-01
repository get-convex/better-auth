"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Todo } from "./components/Todo";
import { useState } from "react";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        Todo App with Convex + Next.js
      </header>
      <main className="p-8 flex flex-col gap-8 max-w-lg mx-auto">
        <h1 className="text-4xl font-bold text-center">Todo List</h1>
        <TodoList />
      </main>
    </>
  );
}

function TodoList() {
  const [newTodo, setNewTodo] = useState("");
  const todos = useQuery(api.todos.get) ?? [];
  const create = useMutation(api.todos.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    await create({ text: newTodo.trim() });
    setNewTodo("");
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 px-4 py-2 border rounded-md"
        />
        <button
          type="submit"
          className="bg-foreground text-background px-4 py-2 rounded-md"
        >
          Add Todo
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {todos.map((todo) => (
          <Todo
            key={todo._id}
            id={todo._id}
            text={todo.text}
            completed={todo.completed}
          />
        ))}
      </div>
    </div>
  );
}
