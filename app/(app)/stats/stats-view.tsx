"use client";

import type { Task, FinanceEntry } from "@/lib/types";
import { useMemo } from "react";
import { csvCell } from "@/lib/csv";

function formatAmount(n: number, currencyCode: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(n);
  } catch {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(n);
  }
}

function toNumber(amount: FinanceEntry["amount"]): number {
  return typeof amount === "string" ? Number.parseFloat(amount) : amount;
}

function downloadExpensesCsv(entries: FinanceEntry[], currencyCode: string) {
  const header = ["occurred_on", "amount", "note"].map(csvCell).join(",");
  const lines = [...entries]
    .sort((a, b) => a.occurred_on.localeCompare(b.occurred_on) || a.created_at.localeCompare(b.created_at))
    .map((e) =>
      [csvCell(e.occurred_on), csvCell(String(toNumber(e.amount))), csvCell(e.note ?? "")].join(","),
    );
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tell-me-expenses-${currencyCode.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function StatsView({ tasks, expenses, currencyCode }: { tasks: Task[]; expenses: FinanceEntry[]; currencyCode: string }) {
  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let monthTotal = 0;
    let todayTotal = 0;
    let monthTasksTotal = 0;
    let monthTasksDone = 0;
    
    // Bar chart data for current week
    const day = today.getDay(); // 0 is Sunday
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - day);
    
    const weekData = Array(7).fill(0).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return {
        dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        label: ["S","M","T","W","T","F","S"][i],
        amount: 0
      };
    });

    expenses.forEach(e => {
      const amt = toNumber(e.amount);
      const eDate = new Date(e.occurred_on);
      
      if (e.occurred_on === todayStr) todayTotal += amt;
      if (eDate.getFullYear() === today.getFullYear() && eDate.getMonth() === today.getMonth()) {
        monthTotal += amt;
      }
      
      const weekIdx = weekData.findIndex(w => w.dateStr === e.occurred_on);
      if (weekIdx !== -1) {
        weekData[weekIdx].amount += amt;
      }
    });

    tasks.forEach(t => {
      const tDate = new Date(t.due_on);
      if (tDate.getFullYear() === today.getFullYear() && tDate.getMonth() === today.getMonth()) {
        monthTasksTotal++;
        if (t.done) monthTasksDone++;
      }
    });

    const daysElapsed = Math.max(today.getDate(), 1);
    const dailyAvgMonth = monthTotal > 0 ? monthTotal / daysElapsed : 0;
    
    let maxWeekAmt = Math.max(...weekData.map(w => w.amount));
    if (maxWeekAmt === 0) maxWeekAmt = 1; // prevent div bypass 0

    return { monthTotal, todayTotal, dailyAvgMonth, monthTasksTotal, monthTasksDone, weekData, maxWeekAmt };
  }, [expenses, tasks]);

  const recentExpenses = expenses.slice(0, 10);

  return (
    <div className="p-4 md:p-8 flex flex-col gap-8 pb-32">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Stats</h2>
        <button 
          onClick={() => downloadExpensesCsv(expenses, currencyCode)}
          className="text-sm font-medium text-[#e07b3a] bg-[#e07b3a]/10 px-4 py-2 rounded-lg hover:bg-[#e07b3a]/20 transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Month Total</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 truncate">{formatAmount(stats.monthTotal, currencyCode)}</div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Spent Today</div>
          <div className="text-2xl font-bold text-[#e07b3a] truncate">{formatAmount(stats.todayTotal, currencyCode)}</div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Tasks Done</div>
          <div className="text-2xl font-bold text-[#5553d4] truncate">{stats.monthTasksDone} / {stats.monthTasksTotal}</div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Daily Avg</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 truncate">{formatAmount(stats.dailyAvgMonth, currencyCode)}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-6 font-sans">This Week</h3>
        <div className="flex items-end justify-between h-40 gap-2">
          {stats.weekData.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
              <div className="w-full relative h-32 flex items-end justify-center">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-xs font-medium text-white px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
                  {formatAmount(d.amount, currencyCode)}
                </div>
                <div 
                  className="w-full max-w-[40px] bg-[#e07b3a]/20 group-hover:bg-[#e07b3a] transition-all rounded-t-md"
                  style={{ height: `${Math.max((d.amount / stats.maxWeekAmt) * 100, 2)}%` }}
                />
              </div>
              <div className="text-xs font-medium text-zinc-400">{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Recent Expenses</h3>
        {recentExpenses.length === 0 ? (
          <p className="text-sm text-zinc-500">No expenses found.</p>
        ) : (
          recentExpenses.map(e => (
            <div key={e.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{e.note || "Expense"}</span>
                <span className="text-xs text-zinc-500">{new Date(e.occurred_on).toLocaleDateString()}</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">{formatAmount(toNumber(e.amount), currencyCode)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
