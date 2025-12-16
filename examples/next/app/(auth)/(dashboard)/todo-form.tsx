"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateTodo } from "./mutations";

export const TodoForm = () => {
  const [newTodo, setNewTodo] = useState("");
  const createTodo = useCreateTodo();
  const handleCreateTodo = async () => {
    const todoText = newTodo.trim();
    if (!todoText) {
      return;
    }
    await createTodo({ text: todoText });
    setNewTodo("");
  };
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        handleCreateTodo();
      }}
    >
      <Input
        name="text"
        placeholder="Add a new todo..."
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        required
      />
      <Button type="submit" variant="secondary" className="cursor-pointer">
        Add
      </Button>
    </form>
  );
};
