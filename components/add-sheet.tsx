"use client";

import { useState, useTransition, useEffect } from "react";
import { addTask } from "@/app/actions/tasks";
import { addFinanceEntry } from "@/app/actions/finance";

function getLocalDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getEndOfWeekString() {
  const d = new Date();
  const day = d.getDay();
  // if sunday is 0, end of week is saturday (6)? Let's assume week ends on Sunday
  const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
  const end = new Date(d.setDate(diff));
  return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
}

function getEndOfMonthString() {
  const d = new Date();
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
}

export function AddSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"menu" | "task" | "expense">("menu");
  const [taskCadence, setTaskCadence] = useState<"daily" | "weekly" | "monthly">("daily");
  
  // Task state
  const [taskTitle, setTaskTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  // Expense state
  const [amount, setAmount] = useState("0");
  const [expenseNote, setExpenseNote] = useState("");

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab("menu");
      setAmount("0");
      setExpenseNote("");
      setTaskTitle("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    let dueOn = getLocalDateString();
    if (taskCadence === "weekly") dueOn = getEndOfWeekString();
    if (taskCadence === "monthly") dueOn = getEndOfMonthString();
    
    startTransition(async () => {
      try {
        await addTask(taskTitle, dueOn, taskCadence);
        onClose();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error adding task");
      }
    });
  }

  function handleNum(num: string) {
    setAmount(prev => {
      if (prev === "0" && num !== ".") return num;
      if (num === "." && prev.includes(".")) return prev;
      return prev + num;
    });
  }

  function handleDeleteNum() {
    setAmount(prev => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  }

  async function handleAddExpense() {
    startTransition(async () => {
      try {
        await addFinanceEntry(parseFloat(amount) || 0, expenseNote, getLocalDateString());
        onClose();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error adding expense");
      }
    });
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-50 dark:bg-zinc-900 rounded-t-3xl shadow-2xl transition-transform max-h-[90vh] flex flex-col md:w-[480px] md:mx-auto md:mb-4 md:rounded-b-3xl">
        <div className="flex justify-center p-4" onClick={onClose} >
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full cursor-pointer" />
        </div>

        <div className="px-6 pb-8 overflow-y-auto w-full">
          {activeTab === "menu" && (
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { setActiveTab("task"); setTaskCadence("daily"); }} className="p-6 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#5553d4]/10 text-[#5553d4] flex items-center justify-center text-xl font-bold">T</div>
                <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50">Task — Today</span>
              </button>
              <button onClick={() => { setActiveTab("task"); setTaskCadence("weekly"); }} className="p-6 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#5553d4]/10 text-[#5553d4] flex items-center justify-center text-xl font-bold">W</div>
                <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50">Task — This Week</span>
              </button>
              <button onClick={() => { setActiveTab("task"); setTaskCadence("monthly"); }} className="p-6 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#5553d4]/10 text-[#5553d4] flex items-center justify-center text-xl font-bold">M</div>
                <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50">Task — This Month</span>
              </button>
              <button onClick={() => setActiveTab("expense")} className="p-6 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#e07b3a]/10 text-[#e07b3a] flex items-center justify-center text-xl font-bold">E</div>
                <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50">Expense</span>
              </button>
            </div>
          )}

          {activeTab === "task" && (
            <form onSubmit={handleAddTask} className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  New {taskCadence} task
                </h3>
                <button type="button" onClick={() => setActiveTab("menu")} className="text-sm text-zinc-500">Back</button>
              </div>
              <input
                autoFocus
                className="w-full text-lg bg-transparent border-b-2 border-zinc-200 dark:border-zinc-700 px-2 py-3 outline-none focus:border-[#5553d4] transition-colors text-zinc-900 dark:text-zinc-50"
                placeholder="What do you need to do?"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
              />
              <button
                disabled={!taskTitle.trim() || isPending}
                className="w-full py-4 rounded-xl font-medium bg-[#5553d4] text-white disabled:opacity-50 mt-4 active:scale-95 transition-transform"
              >
                {isPending ? "Adding..." : "Add task"}
              </button>
            </form>
          )}

          {activeTab === "expense" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">New Expense</h3>
                <button type="button" onClick={() => setActiveTab("menu")} className="text-sm text-zinc-500">Back</button>
              </div>
              
              <div className="py-6 text-center">
                <div className="text-5xl font-light tracking-tight text-zinc-900 dark:text-zinc-50 truncate overflow-hidden">
                  <span className="text-[#e07b3a] mr-1">$</span>
                  {amount}
                </div>
              </div>

              <input
                className="w-full text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-[#e07b3a] transition-colors text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400"
                placeholder="What was this for? (optional)"
                value={expenseNote}
                onChange={e => setExpenseNote(e.target.value)}
              />

              <div className="grid grid-cols-3 gap-3 mt-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleNum(n.toString())}
                    className="py-4 text-xl font-medium bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-700 text-zinc-900 dark:text-zinc-50 transition-colors"
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleDeleteNum}
                  className="py-4 text-xl font-medium bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/><line x1="18" x2="12" y1="9" y2="15"/><line x1="12" x2="18" y1="9" y2="15"/></svg>
                </button>
              </div>
              
              <button
                onClick={handleAddExpense}
                disabled={parseFloat(amount) === 0 || isNaN(parseFloat(amount)) || isPending}
                className="w-full py-4 rounded-xl font-medium bg-[#e07b3a] text-white disabled:opacity-50 mt-2 active:scale-95 transition-transform"
              >
                {isPending ? "Adding..." : "Add expense"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
