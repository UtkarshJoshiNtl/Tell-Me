"use client";

import { addTask, deleteTask, setTaskDone } from "@/app/actions/tasks";
import type { Task, TaskCadence } from "@/lib/types";
import { useMemo, useState, useTransition } from "react";

const cadences: TaskCadence[] = ["daily", "weekly", "monthly"];

export function TasksPanel({ tasks }: { tasks: Task[] }) {
  const [cadence, setCadence] = useState<TaskCadence>("daily");
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () => tasks.filter((t) => t.cadence === cadence),
    [tasks, cadence],
  );

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    startTransition(async () => {
      await addTask(t, cadence);
      setTitle("");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2" role="tablist" aria-label="Task period">
        {cadences.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={cadence === c}
            onClick={() => setCadence(c)}
            className={`rounded px-3 py-1.5 text-sm capitalize ${
              cadence === c
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <form onSubmit={onAdd} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">New task</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Add a ${cadence} task`}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <li className="text-sm text-zinc-500">No {cadence} tasks yet.</li>
        ) : (
          filtered.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800"
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={(e) => {
                  startTransition(() => setTaskDone(task.id, e.target.checked));
                }}
                className="h-4 w-4 shrink-0"
              />
              <span
                className={`min-w-0 flex-1 text-sm ${
                  task.done ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-zinc-50"
                }`}
              >
                {task.title}
              </span>
              <button
                type="button"
                onClick={() => startTransition(() => deleteTask(task.id))}
                className="shrink-0 text-xs text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
