"use server";

import { throwIfSupabaseError } from "@/lib/supabase/errors";
import { getAuthorizedClient } from "@/lib/supabase/session";
import { revalidatePath } from "next/cache";

export async function addFinanceEntry(
  amount: number,
  note: string,
  occurredOn: string,
) {
  const { supabase, user } = await getAuthorizedClient();

  const { error } = await supabase.from("finance_entries").insert({
    user_id: user.id,
    amount,
    note: note.trim() || null,
    occurred_on: occurredOn,
  });
  throwIfSupabaseError(error);
  revalidatePath("/finance");
}

export async function deleteFinanceEntry(id: string) {
  const { supabase, user } = await getAuthorizedClient();
  const { error } = await supabase
    .from("finance_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  throwIfSupabaseError(error);
  revalidatePath("/finance");
}
