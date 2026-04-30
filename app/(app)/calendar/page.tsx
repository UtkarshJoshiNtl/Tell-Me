import { requireSessionUser } from "@/lib/supabase/session";
import type { Task, FinanceEntry } from "@/lib/types";
import { CalendarView } from "./calendar-view";

export default async function CalendarPage() {
  const { supabase, user } = await requireSessionUser();

  // Calculate date range: current month ± 1 month
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  // Fetch tasks within date range
  const { data: tasksData } = await supabase
    .from("tasks")
    .select("id,user_id,title,cadence,due_on,done,created_at")
    .eq("user_id", user.id)
    .gte('due_on', startDateStr)
    .lte('due_on', endDateStr);

  // Fetch expenses within date range
  const { data: expensesData } = await supabase
    .from("finance_entries")
    .select("id,user_id,amount,note,occurred_on,created_at")
    .eq("user_id", user.id)
    .gte('occurred_on', startDateStr)
    .lte('occurred_on', endDateStr);

  const tasks = (tasksData ?? []) as Task[];
  const expenses = (expensesData ?? []) as FinanceEntry[];

  return (
    <div className="max-w-3xl mx-auto min-h-full">
      <CalendarView tasks={tasks} expenses={expenses} />
    </div>
  );
}
