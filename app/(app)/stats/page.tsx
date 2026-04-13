import { requireSessionUser } from "@/lib/supabase/session";
import type { Task, FinanceEntry } from "@/lib/types";
import { StatsView } from "./stats-view";

function defaultCurrency(): string {
  const c = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY?.trim();
  if (c && /^[A-Z]{3}$/i.test(c)) return c.toUpperCase();
  return "USD";
}

export default async function StatsPage() {
  const { supabase, user } = await requireSessionUser();
  const currencyCode = defaultCurrency();

  // We could query specifically, but getting all isn't terrible for a simple app
  // or we can just fetch everything to reuse client logic
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id,user_id,title,cadence,due_on,done,created_at")
    .eq("user_id", user.id);

  const { data: expenses } = await supabase
    .from("finance_entries")
    .select("id,user_id,amount,note,occurred_on,created_at")
    .eq("user_id", user.id)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto min-h-full">
      <StatsView 
        tasks={(tasks ?? []) as Task[]} 
        expenses={(expenses ?? []) as FinanceEntry[]} 
        currencyCode={currencyCode} 
      />
    </div>
  );
}
