import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";
import {
  AddTodoForm,
  TodoListContainer,
  TodoCompleteButton,
  TodoEmptyState,
  TodoItem,
  TodoList as TodoListComponent,
  TodoRemoveButton,
  TodoText,
} from "@/app/ui/server";

export const TodoList = () => {
  const [newTodo, setNewTodo] = useState("");
  const todos = useQuery(api.todos.get) ?? [];
  const create = useMutation(api.todos.create);
  const toggle = useMutation(api.todos.toggle);
  const remove = useMutation(api.todos.remove);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    await create({ text: newTodo.trim() });
    setNewTodo("");
  };

  return (
    <TodoListContainer>
      <AddTodoForm onSubmit={handleSubmit} />
      <TodoListComponent>
        {todos.map((todo) => (
          <TodoItem key={todo._id}>
            <TodoCompleteButton
              completed={todo.completed}
              onClick={() => toggle({ id: todo._id })}
            />
            <TodoText text={todo.text} completed={todo.completed} />
            <TodoRemoveButton onClick={() => remove({ id: todo._id })} />
          </TodoItem>
        ))}
      </TodoListComponent>
      {todos.length === 0 && <TodoEmptyState />}
    </TodoListContainer>
  );
};
