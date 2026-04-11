import { redirect } from "next/navigation";
import { createClient } from "./server";

/** For server actions: authenticated client or throws (no redirect). */
export async function getAuthorizedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return { supabase, user };
}

/** For Server Components: Supabase + user, or redirect to login. */
export async function requireSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  return { supabase, user };
}
