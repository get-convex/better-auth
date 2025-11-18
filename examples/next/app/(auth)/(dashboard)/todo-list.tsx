"use client";

import { api } from "@/convex/_generated/api";
import {
  Preloaded,
  useConvexAuth,
  useMutation,
  usePreloadedQuery,
} from "convex/react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Trash2, X } from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";

// Mutations w/ optimistic updates
const useCreateTodo = () =>
  useMutation(api.todos.create).withOptimisticUpdate((localStore, args) => {
    const todos = localStore.getQuery(api.todos.get);
    if (!todos) {
      return;
    }
    const user = localStore.getQuery(api.auth.getCurrentUser);
    if (!user) {
      return;
    }
    localStore.setQuery(api.todos.get, {}, [
      {
        _id: crypto.randomUUID() as Id<"todos">,
        _creationTime: Date.now(),
        text: args.text,
        completed: false,
        userId: user._id,
      },
      ...todos,
    ]);
  });

const useToggleCompleted = () =>
  useMutation(api.todos.toggle).withOptimisticUpdate((localStore, args) => {
    const todos = localStore.getQuery(api.todos.get);
    if (!todos) {
      return;
    }
    const index = todos.findIndex((todo) => todo._id === args.id);
    const todo = todos[index];
    if (!todo) {
      return;
    }
    localStore.setQuery(
      api.todos.get,
      {},
      todos.toSpliced(index, 1, {
        ...todo,
        completed: !todo.completed,
      }),
    );
  });

const useRemoveTodo = () =>
  useMutation(api.todos.remove).withOptimisticUpdate((localStore, args) => {
    const todos = localStore.getQuery(api.todos.get);
    if (!todos) {
      return;
    }
    const index = todos.findIndex((todo) => todo._id === args.id);
    localStore.setQuery(api.todos.get, {}, todos.toSpliced(index, 1));
  });

const CreateTodoForm = () => {
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

const TodoItem = ({
  todo,
  onToggleCompleted,
  onRemove,
}: {
  todo: Doc<"todos">;
  onToggleCompleted: ({ id }: { id: Id<"todos"> }) => void;
  onRemove: ({ id }: { id: Id<"todos"> }) => void;
}) => {
  return (
    <li
      className="flex items-center gap-3 p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg group hover:bg-neutral-900 transition-colors"
      key={todo._id}
    >
      <Button
        variant="ghost"
        size="icon"
        className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 cursor-pointer"
        onClick={() => onToggleCompleted({ id: todo._id })}
      >
        {todo.completed ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <X size={16} />
        )}
      </Button>

      <span
        className={
          todo.completed
            ? "flex-1 line-through text-neutral-500"
            : "flex-1 text-neutral-100"
        }
      >
        {todo.text}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove({ id: todo._id })}
        className="text-neutral-500 hover:text-red-400 hover:bg-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        <Trash2 size={16} />
      </Button>
    </li>
  );
};

export const TodoList = ({
  preloadedTodosQuery,
}: {
  preloadedTodosQuery: Preloaded<typeof api.todos.get>;
}) => {
  const { isLoading } = useConvexAuth();
  const toggleCompleted = useToggleCompleted();
  const removeTodo = useRemoveTodo();
  const preloadedTodos = usePreloadedQuery(preloadedTodosQuery);
  const [todos, setTodos] = useState(preloadedTodos);

  useEffect(() => {
    if (!isLoading) {
      setTodos(preloadedTodos);
    }
  }, [preloadedTodos, isLoading]);

  return (
    <main>
      <div className="max-w-2xl mx-auto space-y-6">
        <CreateTodoForm />

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
