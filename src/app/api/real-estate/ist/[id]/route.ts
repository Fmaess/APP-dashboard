import { NextResponse } from "next/server";
import { createClient, currentUser } from "@/lib/supabase/server";

const ID = /^\d{4}-(0[1-9]|1[0-2])$/;

// PUT → save one month ({ y, m, werte, notiz, at })
export async function PUT(req: Request, ctx: RouteContext<"/api/real-estate/ist/[id]">) {
  const { id } = await ctx.params;
  if (!ID.test(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || typeof body.werte !== "object") {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }
  const werte: Record<string, number> = {};
  for (const [k, v] of Object.entries(body.werte as Record<string, unknown>)) {
    if (/^[a-zA-Z0-9]{1,8}$/.test(k) && typeof v === "number" && Number.isFinite(v)) werte[k] = v;
  }
  const data = {
    y: Number(body.y), m: Number(body.m), werte,
    notiz: String(body.notiz ?? "").slice(0, 200),
    by: user.id, at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("re_ist").upsert({ user_id: user.id, id, data, updated_at: data.at });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/real-estate/ist/[id]">) {
  const { id } = await ctx.params;
  if (!ID.test(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from("re_ist").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
