const DEFAULT_AFTER_AUTH = "/tasks";

/**
 * Returns a same-origin relative path safe to pass to redirects (blocks open redirects).
 */
export function getSafeRedirectPath(raw: string | null | undefined, fallback = DEFAULT_AFTER_AUTH): string {
  if (raw == null || typeof raw !== "string") return fallback;
  const trimmed = raw.trim().split("?")[0].split("#")[0];
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\") || trimmed.includes("//")) return fallback;
  // ASCII path segments only; hyphen last in class to avoid range bugs
  if (!/^\/[-A-Za-z0-9._/]*$/.test(trimmed)) return fallback;
  return trimmed.length > 0 ? trimmed : fallback;
}
