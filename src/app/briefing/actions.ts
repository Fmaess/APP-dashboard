"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, currentUser } from "@/lib/supabase/server";

export async function addBriefing(formData: FormData) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const body_md = String(formData.get("body") ?? "").trim();
  const for_date = String(formData.get("for_date") ?? "") || new Date().toISOString().slice(0, 10);
  if (!title || !body_md) return;

  const supabase = await createClient();
  const { error } = await supabase.from("briefings").insert({ user_id: user.id, title, body_md, for_date });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/briefing");
  redirect("/briefing");
}

export async function deleteBriefing(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("briefings").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/briefing");
  redirect("/briefing");
}
