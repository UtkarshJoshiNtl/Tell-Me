"use server";

import { createClient } from "@/lib/supabase/server";
import type { TaskCadence } from "@/lib/types";
import { revalidatePath } from "next/cache";

async function getAuthorizedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return { supabase, user };
}

export async function addTask(title: string, cadence: TaskCadence) {
  const { supabase, user } = await getAuthorizedClient();

  const t = title.trim();
  if (!t) return;

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    title: t,
    cadence,
  });
  if (error) throw error;
  revalidatePath("/tasks");
}

export async function setTaskDone(id: string, done: boolean) {
  const { supabase, user } = await getAuthorizedClient();
  const { error } = await supabase
    .from("tasks")
    .update({ done })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/tasks");
}

export async function deleteTask(id: string) {
  const { supabase, user } = await getAuthorizedClient();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/tasks");
}
