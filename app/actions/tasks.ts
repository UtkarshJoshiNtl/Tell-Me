"use server";

import { throwIfSupabaseError } from "@/lib/supabase/errors";
import { getAuthorizedClient } from "@/lib/supabase/session";
import type { TaskType } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function addTask(title: string, dueOn: string, type: TaskType) {
  const { supabase, user } = await getAuthorizedClient();

  const t = title.trim();
  if (!t) {
    throw new Error("Title is required.");
  }

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    title: t,
    cadence: type,
    due_on: dueOn,
  });
  throwIfSupabaseError(error);
  revalidatePath("/tasks");
}

export async function updateTask(
  id: string,
  title: string,
  dueOn: string,
  type: TaskType,
) {
  const { supabase, user } = await getAuthorizedClient();
  const t = title.trim();
  if (!t) {
    throw new Error("Title is required.");
  }
  const { error } = await supabase
    .from("tasks")
    .update({ title: t, due_on: dueOn, cadence: type })
    .eq("id", id)
    .eq("user_id", user.id);
  throwIfSupabaseError(error);
  revalidatePath("/tasks");
}

export async function setTaskDone(id: string, done: boolean) {
  const { supabase, user } = await getAuthorizedClient();
  const { error } = await supabase
    .from("tasks")
    .update({ done })
    .eq("id", id)
    .eq("user_id", user.id);
  throwIfSupabaseError(error);
  revalidatePath("/tasks");
}

export async function deleteTask(id: string) {
  const { supabase, user } = await getAuthorizedClient();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  throwIfSupabaseError(error);
  revalidatePath("/tasks");
}
