"use client";

import { useState, useMemo, useTransition } from "react";
import type { Task, FinanceEntry } from "@/lib/types";
import { setTaskDone } from "@/app/actions/tasks";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function CalendarView({ tasks, expenses }: { tasks: Task[]; expenses: FinanceEntry[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isPending, startTransition] = useTransition();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  const selectedDateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const days = useMemo(() => {
    const d = [];
    for (let i = 0; i < firstDay; i++) {
      d.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasTask = tasks.some(t => t.due_on === dateStr);
      const hasExpense = expenses.some(e => e.occurred_on === dateStr);
      d.push({ day: i, dateStr, hasTask, hasExpense });
    }
    return d;
  }, [currentYear, currentMonth, daysInMonth, firstDay, tasks, expenses]);

  function prevMonth() {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  }

  const selectedTasks = tasks.filter(t => t.due_on === selectedDateString);
  const selectedExpenses = expenses.filter(e => e.occurred_on === selectedDateString);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const isToday = (d: Date, day: number) => {
    const today = new Date();
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && day === today.getDate();
  };

  const isSelected = (dateStr: string) => dateStr === selectedDateString;

  async function handleTaskCheck(id: string, done: boolean) {
    startTransition(async () => {
      try {
        await setTaskDone(id, done);
      } catch (err) {
        console.error(err);
      }
    });
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      <div className="p-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{monthNames[currentMonth]} {currentYear}</h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="px-3 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Prev</button>
          <button onClick={nextMonth} className="px-3 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Next</button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-7 gap-y-4 gap-x-2 text-center text-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="text-zinc-400 font-medium text-xs uppercase cursor-default">{d}</div>
        ))}
        {days.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const today = isToday(currentDate, d.day);
          const selected = isSelected(d.dateStr);

          return (
            <button
              key={d.day}
              onClick={() => setSelectedDate(new Date(currentYear, currentMonth, d.day))}
              className={`flex flex-col items-center justify-start h-12 w-full pt-1 rounded-xl transition-colors ${selected ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
            >
              <div className={`w-7 h-7 flex items-center justify-center rounded-full ${today ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-semibold' : 'text-zinc-700 dark:text-zinc-300'}`}>
                {d.day}
              </div>
              <div className="flex gap-1 mt-1">
                {d.hasTask && <div className="w-1.5 h-1.5 rounded-full bg-[#5553d4]" />}
                {d.hasExpense && <div className="w-1.5 h-1.5 rounded-full bg-[#e07b3a]" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-900 font-sans pb-24 border-t border-zinc-200 dark:border-zinc-800">
        <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50 mb-4 sticky top-0">
          Agenda: {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </h3>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Tasks</div>
            {selectedTasks.length === 0 ? (
              <p className="text-sm text-zinc-500">No tasks.</p>
            ) : (
              selectedTasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                  <input 
                    type="checkbox" 
                    checked={t.done}
                    disabled={isPending}
                    onChange={(e) => handleTaskCheck(t.id, e.target.checked)}
                    className="w-5 h-5 accent-[#5553d4] rounded"
                  />
                  <span className={`text-sm ${t.done ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>{t.title}</span>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Expenses</div>
            {selectedExpenses.length === 0 ? (
              <p className="text-sm text-zinc-500">No expenses.</p>
            ) : (
              selectedExpenses.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{e.note || "Expense"}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#e07b3a]">${e.amount.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
