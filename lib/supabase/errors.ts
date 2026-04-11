/** Supabase/PostgREST errors must be thrown as `Error` so Next.js server actions serialize them to the client. */
export function throwIfSupabaseError(
  error: { message: string; code?: string; hint?: string | null; details?: string | null } | null,
): asserts error is null {
  if (!error) return;
  const parts = [error.message, error.hint, error.details].filter(
    (p): p is string => typeof p === "string" && p.length > 0,
  );
  throw new Error(parts.join(" — ") || "Database request failed");
}
