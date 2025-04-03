"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Todo } from "./components/Todo";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Trash2 } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { authClient } from "@/app/auth-client";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import { Toaster } from "sonner";
import Link from "next/link";

export default function Home() {
  const [showSignIn, setShowSignIn] = useState(true);
  const convexAuth = useConvexAuth();
  const user = useQuery(api.example.getCurrentUser);
  const deleteAccount = useMutation(api.example.deleteAccount);

  if (convexAuth.isLoading || user === undefined) {
    return <div className="text-neutral-400">Loading...</div>;
  }

  if (!convexAuth.isAuthenticated || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {showSignIn ? <SignIn /> : <SignUp />}
          <p className="text-center mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            {showSignIn
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => setShowSignIn(!showSignIn)}
              className="text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200 underline"
            >
              {showSignIn ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
        <Toaster />
      </div>
    );
  }

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      await deleteAccount();
      await authClient.deleteUser();
    }
  };

  return (
    <div className="min-h-screen w-full p-4 space-y-8">
      <header className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            {user.image ? (
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
                {user.name[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-medium">{user.name}</h1>
              <p className="text-sm text-neutral-500">{user.email}</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={handleDeleteAccount}>
            <Trash2 size={16} className="mr-2" />
            Delete Account
          </Button>
          <Button variant="ghost" onClick={() => authClient.signOut()}>
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
