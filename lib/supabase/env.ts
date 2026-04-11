/**
 * Central place for Supabase public config (browser, server, Edge middleware).
 *
 * Accepts either NEXT_PUBLIC_* (required for the browser bundle) or SUPABASE_*
 * aliases so local `.env.local` can match Supabase CLI / dashboard naming.
 */

function firstDefined(...candidates: (string | undefined)[]): string | undefined {
  for (const c of candidates) {
    const t = c?.trim();
    if (t) return t;
  }
  return undefined;
}

export function getSupabaseUrl(): string {
  const url = firstDefined(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
  );
  if (!url) {
    throw new Error(
      "Missing Supabase URL: set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL in .env.local",
    );
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = firstDefined(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_ANON_KEY,
  );
  if (!key) {
    throw new Error(
      "Missing Supabase anon key: set NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY in .env.local",
    );
  }
  return key;
}
