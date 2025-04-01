import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function Todo({
  id,
  text,
  completed,
}: {
  id: Id<"todos">;
  text: string;
  completed: boolean;
}) {
  const toggle = useMutation(api.todos.toggle);
  const remove = useMutation(api.todos.remove);

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={completed}
        onChange={() => toggle({ id })}
        className="h-4 w-4"
      />
      <span className={completed ? "line-through text-gray-500" : ""}>
        {text}
      </span>
      <button
        onClick={() => remove({ id })}
        className="ml-auto text-red-500 hover:text-red-700"
      >
        Delete
      </button>
    </div>
  );
}
