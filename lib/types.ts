/** Stored as `cadence` in the database; shown as "type" in the UI. */
export type TaskType = "daily" | "weekly" | "monthly";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  cadence: TaskType;
  due_on: string;
  done: boolean;
  created_at: string;
};

export type FinanceEntry = {
  id: string;
  user_id: string;
  amount: number;
  note: string | null;
  occurred_on: string;
  created_at: string;
};
