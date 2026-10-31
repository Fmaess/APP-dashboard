import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET → all recorded months for the signed-in user
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("re_ist").select("id, data").order("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ docs: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}
