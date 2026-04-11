"use client";

import { addFinanceEntry, deleteFinanceEntry } from "@/app/actions/finance";
import type { FinanceEntry } from "@/lib/types";
import { useState, useTransition } from "react";

function formatAmount(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function parseAmount(raw: string): number | null {
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100) / 100;
}

export function FinancePanel({ entries }: { entries: FinanceEntry[] }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [pending, startTransition] = useTransition();

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    const n = parseAmount(amount);
    if (n === null) return;
    startTransition(async () => {
      await addFinanceEntry(n, note, date);
      setAmount("");
      setNote("");
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={onAdd} className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm sm:col-span-1">
          <span className="text-zinc-600 dark:text-zinc-400">Amount</span>
          <input
            type="number"
            step="0.01"
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
            value={date}
            onChange={(e) => setDate(e.target.value)}
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
            Add entry
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="pb-2 pr-4 font-medium">Date</th>
              <th className="pb-2 pr-4 font-medium">Amount</th>
              <th className="pb-2 pr-4 font-medium">Note</th>
              <th className="pb-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-zinc-500">
                  No entries yet.
                </td>
              </tr>
            ) : (
              entries.map((row) => {
                const amt =
                  typeof row.amount === "string"
                    ? Number.parseFloat(row.amount)
                    : row.amount;
                return (
                  <tr key={row.id} className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="py-2 pr-4 align-top text-zinc-700 dark:text-zinc-300">
                      {row.occurred_on}
                    </td>
                    <td className="py-2 pr-4 align-top tabular-nums">{formatAmount(amt)}</td>
                    <td className="py-2 pr-4 align-top text-zinc-600 dark:text-zinc-400">
                      {row.note ?? "—"}
                    </td>
                    <td className="py-2 align-top">
                      <button
                        type="button"
                        onClick={() => startTransition(() => deleteFinanceEntry(row.id))}
                        className="text-xs text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
