-- Inserts referencing public.task_cadence need USAGE on the enum type for API roles.
grant usage on type public.task_cadence to anon, authenticated, service_role;
