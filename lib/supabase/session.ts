import { redirect } from "next/navigation";
import { createClient } from "./server";

/** Returns the Supabase client and user, or redirects to login (for protected routes). */
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
