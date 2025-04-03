"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Todo } from "@/app/(auth)/dashboard/Todo";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Settings, LogOut } from "lucide-react";
import { Toaster } from "sonner";
import { authClient } from "@/app/auth-client";

export default function AppPage() {
  const user = useQuery(api.example.getCurrentUser);

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <div className="min-h-screen w-full p-4 space-y-8">
      <header className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-200 font-medium">
                {user?.name?.[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-medium">{user?.name}</h1>
              <p className="text-sm text-neutral-500">{user?.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings" className="flex items-center gap-2">
              <Settings size={16} />
              Settings
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut size={16} className="mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      <main>
        <TodoList />
      </main>
      <Toaster />
    </div>
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
    <div className="max-w-2xl mx-auto space-y-6">
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500"
        />
        <Button type="submit" variant="secondary">
          Add
        </Button>
      </form>

      <ul className="space-y-3">
        {todos.map((todo) => (
          <Todo
            key={todo._id}
            id={todo._id}
            text={todo.text}
            completed={todo.completed}
          />
        ))}
      </ul>

      {todos.length === 0 && (
        <p className="text-center text-neutral-500 py-8">
          No todos yet. Add one above!
        </p>
      )}
    </div>
  );
}
