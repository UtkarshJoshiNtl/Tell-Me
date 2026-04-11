"use server";

import { throwIfSupabaseError } from "@/lib/supabase/errors";
import { getAuthorizedClient } from "@/lib/supabase/session";
import { revalidatePath } from "next/cache";

const NOTE_MAX = 2000;
const AMOUNT_MAX = 999_999_999_999.99;

function assertValidAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0 || amount > AMOUNT_MAX) {
    throw new Error("Enter a valid amount greater than zero.");
  }
}

function normalizeNote(note: string): string | null {
  const t = note.trim().slice(0, NOTE_MAX);
  return t.length > 0 ? t : null;
}

export async function addFinanceEntry(
  amount: number,
  note: string,
  occurredOn: string,
) {
  const { supabase, user } = await getAuthorizedClient();
  assertValidAmount(amount);

  const { error } = await supabase.from("finance_entries").insert({
    user_id: user.id,
    amount,
    note: normalizeNote(note),
    occurred_on: occurredOn,
  });
  throwIfSupabaseError(error);
  revalidatePath("/finance");
}

export async function updateFinanceEntry(
  id: string,
  amount: number,
  note: string,
  occurredOn: string,
) {
  const { supabase, user } = await getAuthorizedClient();
  assertValidAmount(amount);

  const { error } = await supabase
    .from("finance_entries")
    .update({
      amount,
      note: normalizeNote(note),
      occurred_on: occurredOn,
    })
    .eq("id", id)
    .eq("user_id", user.id);
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
