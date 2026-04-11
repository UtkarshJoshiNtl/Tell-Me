"use client";

import { addFinanceEntry, deleteFinanceEntry } from "@/app/actions/finance";
import type { FinanceEntry } from "@/lib/types";
import { useMemo, useState, useTransition } from "react";

function formatAmount(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function toNumber(amount: FinanceEntry["amount"]): number {
  return typeof amount === "string" ? Number.parseFloat(amount) : amount;
}

function parseAmount(raw: string): number | null {
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

function groupEntriesByDate(entries: FinanceEntry[]): { date: string; rows: FinanceEntry[] }[] {
  const map = new Map<string, FinanceEntry[]>();
  for (const e of entries) {
    const list = map.get(e.occurred_on) ?? [];
    list.push(e);
    map.set(e.occurred_on, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, rows]) => ({ date, rows }));
}

export function FinancePanel({ entries }: { entries: FinanceEntry[] }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const byDate = useMemo(() => groupEntriesByDate(entries), [entries]);

  const totalForSelectedDay = useMemo(() => {
    return entries
      .filter((e) => e.occurred_on === selectedDay)
      .reduce((sum, e) => sum + toNumber(e.amount), 0);
  }, [entries, selectedDay]);

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    const n = parseAmount(amount);
    if (n === null) return;
    startTransition(async () => {
      try {
        setActionError(null);
        await addFinanceEntry(n, note, expenseDate);
        setAmount("");
        setNote("");
        setSelectedDay(expenseDate);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Could not add expense");
      }
    });
  }

  return (
    <div className="flex flex-col gap-10">
      {actionError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {actionError}
        </p>
      ) : null}

      <section>
        <h2 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">Add expense</h2>
        <form onSubmit={onAdd} className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm sm:col-span-1">
            <span className="text-zinc-600 dark:text-zinc-400">Amount</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-1">
            <span className="text-zinc-600 dark:text-zinc-400">Date</span>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="text-zinc-600 dark:text-zinc-400">Note</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional"
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Add expense
            </button>
          </div>
        </form>
      </section>

      <section className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
        <label className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Total for selected day
          </span>
          <input
            type="date"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="w-full max-w-[200px] rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
        <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
          {formatAmount(totalForSelectedDay)}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {entries.filter((e) => e.occurred_on === selectedDay).length} expense
          {entries.filter((e) => e.occurred_on === selectedDay).length === 1 ? "" : "s"} on this day
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">Expenses by date</h2>
        {byDate.length === 0 ? (
          <p className="text-sm text-zinc-500">No expenses yet. Add one above.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {byDate.map(({ date, rows }) => {
              const dayTotal = rows.reduce((s, r) => s + toNumber(r.amount), 0);
              return (
                <div key={date}>
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{date}</h3>
                    <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                      Day total: {formatAmount(dayTotal)}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {rows.map((row) => (
                      <li
                        key={row.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-900"
                      >
                        <span className="tabular-nums font-medium">{formatAmount(toNumber(row.amount))}</span>
                        <span className="min-w-0 flex-1 text-zinc-600 dark:text-zinc-400">
                          {row.note?.trim() ? row.note : "—"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            startTransition(async () => {
                              try {
                                setActionError(null);
                                await deleteFinanceEntry(row.id);
                              } catch (err) {
                                setActionError(
                                  err instanceof Error ? err.message : "Could not remove expense",
                                );
                              }
                            })
                          }
                          className="shrink-0 text-xs text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
