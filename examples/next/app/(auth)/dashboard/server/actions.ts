"use server";

import { Id } from "@/convex/_generated/dataModel";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getToken } from "@convex-dev/better-auth/nextjs";
import { createAuth } from "@/convex/auth";

// Authenticated mutation via server function
export async function removeTodo(id: Id<"todos">) {
  const token = await getToken(createAuth);
  await fetchMutation(api.todos.remove, { id }, { token });
}
