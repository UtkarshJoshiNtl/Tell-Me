import type { NextConfig } from "next";

/**
 * Inline Supabase env for all runtimes (including Edge middleware / Turbopack dev),
 * with SUPABASE_* fallbacks if NEXT_PUBLIC_* is not set.
 */
const nextConfig: NextConfig = {
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "",
  },
};

export default nextConfig;
