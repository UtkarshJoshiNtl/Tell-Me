-- Idempotent migration to sync database schema with codebase
-- Run this in Supabase SQL Editor to fix any missing objects

-- Create task_cadence enum type (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_cadence') THEN
        CREATE TYPE public.task_cadence AS ENUM ('daily', 'weekly', 'monthly');
    END IF;
END $$;

-- Create tasks table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  cadence public.task_cadence not null default 'daily',
  due_on date not null default (timezone('utc', now()))::date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- Add missing columns to tasks table if they don't exist
DO $$
BEGIN
    -- Add cadence column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'cadence'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN cadence public.task_cadence NOT NULL DEFAULT 'daily';
    END IF;
    
    -- Add due_on column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'due_on'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN due_on date NOT NULL DEFAULT (timezone('utc', now()))::date;
    END IF;
    
    -- Add done column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'done'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN done boolean NOT NULL DEFAULT false;
    END IF;
END $$;

-- Create finance_entries table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(14, 2) not null,
  note text,
  occurred_on date not null,
  created_at timestamptz not null default now()
);

-- Create indexes (only if they don't exist)
CREATE INDEX IF NOT EXISTS tasks_user_cadence_idx ON public.tasks (user_id, cadence);
CREATE INDEX IF NOT EXISTS tasks_user_due_on_idx ON public.tasks (user_id, due_on);
CREATE INDEX IF NOT EXISTS finance_entries_user_date_idx ON public.finance_entries (user_id, occurred_on desc);

-- Enable row level security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_entries ENABLE ROW LEVEL SECURITY;

-- Create policies (DROP IF EXISTS first, then CREATE)
DROP POLICY IF EXISTS "tasks_select_own" ON public.tasks;
CREATE POLICY "tasks_select_own" ON public.tasks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_insert_own" ON public.tasks;
CREATE POLICY "tasks_insert_own" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_update_own" ON public.tasks;
CREATE POLICY "tasks_update_own" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_delete_own" ON public.tasks;
CREATE POLICY "tasks_delete_own" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "finance_select_own" ON public.finance_entries;
CREATE POLICY "finance_select_own" ON public.finance_entries FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "finance_insert_own" ON public.finance_entries;
CREATE POLICY "finance_insert_own" ON public.finance_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "finance_update_own" ON public.finance_entries;
CREATE POLICY "finance_update_own" ON public.finance_entries FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "finance_delete_own" ON public.finance_entries;
CREATE POLICY "finance_delete_own" ON public.finance_entries FOR DELETE USING (auth.uid() = user_id);

-- Grant usage on enum type (safe to run multiple times)
DO $$
BEGIN
    GRANT USAGE ON TYPE public.task_cadence TO anon, authenticated, service_role;
EXCEPTION WHEN duplicate_object THEN
    -- Ignore if already granted
    NULL;
END $$;
