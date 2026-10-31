import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/server";
import { addBriefing, deleteBriefing } from "./actions";

export const metadata: Metadata = { title: "Briefing" };
export const dynamic = "force-dynamic";

const fmt = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export default async function BriefingPage({ searchParams }: PageProps<"/briefing">) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: list } = await supabase
    .from("briefings")
    .select("id, for_date, title, created_at")
    .order("for_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(30);

  const wanted = typeof sp.id === "string" ? sp.id : list?.[0]?.id;
  const { data: current } = wanted
    ? await supabase.from("briefings").select("id, for_date, title, body_md").eq("id", wanted).maybeSingle()
    : { data: null };
  const isLatest = current && current.id === list?.[0]?.id;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="shell">
      <div className="topbar">
        <Link className="btn" href="/">← Dashboard</Link>
        <a className="btn" href="#neu">Neues Briefing</a>
      </div>

      {current ? (
        <article className="card prose">
          <div className="eyebrow">{isLatest ? "Aktuell" : "Archiv"} · {fmt(current.for_date)}</div>
          <h1>{current.title}</h1>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{current.body_md}</ReactMarkdown>
          <form action={deleteBriefing} style={{ marginTop: 20 }}>
            <input type="hidden" name="id" value={current.id} />
            <button className="btn" type="submit">Löschen</button>
          </form>
        </article>
      ) : (
        <div className="card">
          <h1>Noch kein Briefing</h1>
          <p className="lead">Füge unten das erste ein. Das Dashboard zeigt immer das neueste.</p>
        </div>
      )}

      {list && list.length > 1 && (
        <section className="card">
          <div className="eyebrow">Frühere Briefings</div>
          <ul>
            {list.map((b) => (
              <li key={b.id}>
                <Link href={`/briefing?id=${b.id}`} style={{ fontWeight: b.id === current?.id ? 600 : 400 }}>
                  {new Date(b.for_date + "T12:00:00").toLocaleDateString("de-DE")} · {b.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form id="neu" className="card form" action={addBriefing}>
        <div className="eyebrow">Neues Briefing</div>
        <label>Titel<input name="title" required maxLength={200} placeholder="Morning Briefing" /></label>
        <label>Datum<input name="for_date" type="date" defaultValue={today} /></label>
        <label>Inhalt (Markdown)<textarea name="body" required placeholder="## Markt&#10;…" /></label>
        <button className="btn pri" type="submit">Speichern</button>
      </form>
    </main>
  );
}
