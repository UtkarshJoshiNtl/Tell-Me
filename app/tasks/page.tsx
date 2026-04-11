import { AppNav } from "@/components/app-nav";
import type { Task } from "@/lib/types";
import { requireSessionUser } from "@/lib/supabase/session";
import { TasksPanel } from "./tasks-panel";

export default async function TasksPage() {
  const { supabase, user } = await requireSessionUser();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id,user_id,title,cadence,done,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-8 px-4 py-10">
      <AppNav path="/tasks" />
      <main>
        <h1 className="mb-6 text-xl font-semibold tracking-tight">Tasks</h1>
        <TasksPanel tasks={(tasks ?? []) as Task[]} />
      </main>
    </div>
  );
}
