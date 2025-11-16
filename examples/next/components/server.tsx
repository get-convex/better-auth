import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Trash2, X } from "lucide-react";
import { FormEvent, PropsWithChildren } from "react";

export const AddTodoForm = ({
  action,
  onSubmit,
}: {
  action?: (formData: FormData) => Promise<void>;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) => {
  return (
    <form className="flex gap-2" action={action} onSubmit={onSubmit}>
      <Input
        name="text"
        placeholder="Add a new todo..."
        className="bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500"
      />
      <Button type="submit" variant="secondary">
        Add
      </Button>
    </form>
  );
};

export const TodoListContainer = ({ children }: PropsWithChildren) => {
  return (
    <main>
      <div className="max-w-2xl mx-auto space-y-6">{children}</div>
    </main>
  );
};

export const TodoCompleteButton = ({
  completed,
  type = "button",
  onClick,
}: {
  completed: boolean;
  type?: "button" | "submit";
  onClick?: () => any;
}) => (
  <Button
    variant="ghost"
    size="icon"
    type={type}
    className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
    onClick={onClick}
  >
    {completed ? (
      <Check size={16} className="text-green-500" />
    ) : (
      <X size={16} />
    )}
  </Button>
);

export const TodoRemoveButton = ({ onClick }: { onClick: () => any }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    className="text-neutral-500 hover:text-red-400 hover:bg-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity"
  >
    <Trash2 size={16} />
  </Button>
);

export const TodoText = ({
  text,
  completed,
}: {
  text: string;
  completed: boolean;
}) => (
  <span
    className={
      completed
        ? "flex-1 line-through text-neutral-500"
        : "flex-1 text-neutral-100"
    }
  >
    {text}
  </span>
);

export const TodoItem = ({ children }: PropsWithChildren) => {
  return (
    <li className="flex items-center gap-3 p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg group hover:bg-neutral-900 transition-colors">
      {children}
    </li>
  );
};

export const TodoList = ({ children }: PropsWithChildren) => {
  return <ul className="space-y-3">{children}</ul>;
};

export const TodoEmptyState = () => {
  return (
    <p className="text-center text-neutral-500 py-8">
      No todos yet. Add one above!
    </p>
  );
};
