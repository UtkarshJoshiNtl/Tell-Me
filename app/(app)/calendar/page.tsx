import { requireSessionUser } from "@/lib/supabase/session";
import type { Task, FinanceEntry } from "@/lib/types";
import { CalendarView } from "./calendar-view";

export default async function CalendarPage() {
  const { supabase, user } = await requireSessionUser();

  // Fetch all incomplete tasks or tasks completed today/recently (but simple query is fine for MVP)
  const { data: tasksData } = await supabase
    .from("tasks")
    .select("id,user_id,title,cadence,due_on,done,created_at")
    .eq("user_id", user.id);

  const { data: expensesData } = await supabase
    .from("finance_entries")
    .select("id,user_id,amount,note,occurred_on,created_at")
    .eq("user_id", user.id);

  const tasks = (tasksData ?? []) as Task[];
  const expenses = (expensesData ?? []) as FinanceEntry[];

  return (
    <div className="max-w-3xl mx-auto min-h-full">
      <CalendarView tasks={tasks} expenses={expenses} />
    </div>
  );
}
