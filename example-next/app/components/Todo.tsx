import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "./ui/button";
import { Check, Trash2, X } from "lucide-react";

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
    <li className="flex items-center gap-3 p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg group hover:bg-neutral-900 transition-colors">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => toggle({ id })}
        className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
      >
        {completed ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <X size={16} />
        )}
      </Button>
      <span
        className={
          completed
            ? "flex-1 line-through text-neutral-500"
            : "flex-1 text-neutral-100"
        }
      >
        {text}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => remove({ id })}
        className="text-neutral-500 hover:text-red-400 hover:bg-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={16} />
      </Button>
    </li>
  );
}
