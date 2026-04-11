-- Run in Supabase SQL Editor or via supabase db push

create type public.task_cadence as enum ('daily', 'weekly', 'monthly');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  cadence public.task_cadence not null default 'daily',
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index tasks_user_cadence_idx on public.tasks (user_id, cadence);

create table public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(14, 2) not null,
  note text,
  occurred_on date not null,
  created_at timestamptz not null default now()
);

create index finance_entries_user_date_idx on public.finance_entries (user_id, occurred_on desc);

alter table public.tasks enable row level security;
alter table public.finance_entries enable row level security;

create policy "tasks_select_own"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "tasks_insert_own"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks_update_own"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "tasks_delete_own"
  on public.tasks for delete
  using (auth.uid() = user_id);

create policy "finance_select_own"
  on public.finance_entries for select
  using (auth.uid() = user_id);

create policy "finance_insert_own"
  on public.finance_entries for insert
  with check (auth.uid() = user_id);

create policy "finance_update_own"
  on public.finance_entries for update
  using (auth.uid() = user_id);

create policy "finance_delete_own"
  on public.finance_entries for delete
  using (auth.uid() = user_id);
