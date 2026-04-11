/**
 * Central place for Supabase public config used by browser + server clients.
 */
export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url?.trim()) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  return url.trim();
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key?.trim()) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return key.trim();
}
