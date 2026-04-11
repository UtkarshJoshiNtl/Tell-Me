import { AppNav } from "@/components/app-nav";
import type { FinanceEntry } from "@/lib/types";
import { requireSessionUser } from "@/lib/supabase/session";
import { FinancePanel } from "./finance-panel";

function defaultCurrency(): string {
  const c = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY?.trim();
  if (c && /^[A-Z]{3}$/i.test(c)) return c.toUpperCase();
  return "USD";
}

export default async function FinancePage() {
  const { supabase, user } = await requireSessionUser();
  const currencyCode = defaultCurrency();
  const { data: entries } = await supabase
    .from("finance_entries")
    .select("id,user_id,amount,note,occurred_on,created_at")
    .eq("user_id", user.id)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-8 px-4 py-10">
      <AppNav path="/finance" />
      <main>
        <h1 className="mb-6 text-xl font-semibold tracking-tight">Expenses</h1>
        <FinancePanel
          entries={(entries ?? []) as FinanceEntry[]}
          currencyCode={currencyCode}
        />
      </main>
    </div>
  );
}
