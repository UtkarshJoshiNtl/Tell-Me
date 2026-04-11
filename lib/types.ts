export type TaskCadence = "daily" | "weekly" | "monthly";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  cadence: TaskCadence;
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
