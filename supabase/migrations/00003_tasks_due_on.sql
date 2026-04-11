-- Task schedule date (run in SQL Editor if you already applied 00001 without this column)
alter table public.tasks
  add column if not exists due_on date not null default (timezone('utc', now()))::date;

create index if not exists tasks_user_due_on_idx on public.tasks (user_id, due_on);
