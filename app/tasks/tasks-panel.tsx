"use client";

import { addTask, deleteTask, setTaskDone, updateTask } from "@/app/actions/tasks";
import type { Task, TaskType } from "@/lib/types";
import { useState, useTransition } from "react";

const taskTypes: TaskType[] = ["daily", "weekly", "monthly"];

export function TasksPanel({ tasks }: { tasks: Task[] }) {
  const [title, setTitle] = useState("");
  const [dueOn, setDueOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [taskType, setTaskType] = useState<TaskType>("daily");
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueOn, setEditDueOn] = useState("");
  const [editType, setEditType] = useState<TaskType>("daily");

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDueOn(task.due_on);
    setEditType(task.cadence);
    setActionError(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    startTransition(async () => {
      try {
        setActionError(null);
        await addTask(t, dueOn, taskType);
        setTitle("");
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Could not add task");
      }
    });
  }

  function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const t = editTitle.trim();
    if (!t) return;
    startTransition(async () => {
      try {
        setActionError(null);
        await updateTask(editingId, t, editDueOn, editType);
        setEditingId(null);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Could not save task");
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {actionError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {actionError}
        </p>
      ) : null}

      <form onSubmit={onAdd} className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="text-zinc-600 dark:text-zinc-400">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What to do"
            required
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Date</span>
          <input
            type="date"
            value={dueOn}
            onChange={(e) => setDueOn(e.target.value)}
            required
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Type</span>
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value as TaskType)}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          >
            {taskTypes.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add task
          </button>
        </div>
      </form>

      <section>
        <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Your tasks</h2>
        <ul className="flex flex-col gap-2">
          {tasks.length === 0 ? (
            <li className="text-sm text-zinc-500">No tasks yet. Add one above.</li>
          ) : (
            tasks.map((task) =>
              editingId === task.id ? (
                <li
                  key={task.id}
                  className="rounded border border-zinc-300 p-3 dark:border-zinc-600"
                >
                  <form onSubmit={onSaveEdit} className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">Title</span>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                        className="rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Date</span>
                        <input
                          type="date"
                          value={editDueOn}
                          onChange={(e) => setEditDueOn(e.target.value)}
                          required
                          className="rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Type</span>
                        <select
                          value={editType}
                          onChange={(e) => setEditType(e.target.value as TaskType)}
                          className="rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                        >
                          {taskTypes.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={pending}
                        className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </li>
              ) : (
                <li
                  key={task.id}
                  className="flex flex-wrap items-center gap-3 rounded border border-zinc-200 px-3 py-2.5 dark:border-zinc-800"
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={(e) => {
                      startTransition(async () => {
                        try {
                          setActionError(null);
                          await setTaskDone(task.id, e.target.checked);
                        } catch (err) {
                          setActionError(
                            err instanceof Error ? err.message : "Could not update task",
                          );
                        }
                      });
                    }}
                    className="h-4 w-4 shrink-0"
                    aria-label={`Mark "${task.title}" complete`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        task.done ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-zinc-50"
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {task.due_on} · <span className="capitalize">{task.cadence}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(task)}
                      className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        startTransition(async () => {
                          try {
                            setActionError(null);
                            await deleteTask(task.id);
                          } catch (err) {
                            setActionError(
                              err instanceof Error ? err.message : "Could not remove task",
                            );
                          }
                        })
                      }
                      className="text-xs text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ),
            )
          )}
        </ul>
      </section>
    </div>
  );
}
