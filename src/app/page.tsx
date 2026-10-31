import Link from "next/link";
import { createClient, currentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const INCOME = ["mE", "mF", "mEG", "mOG", "mGa"];
const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const eur = (n: number) => new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(Math.round(n)) + " €";
const cf = (w: Record<string, number>) =>
  Object.entries(w).reduce((s, [k, v]) => s + (INCOME.includes(k) ? v : -v), 0);

type Ist = { id: string; data: { werte: Record<string, number>; at?: string } };

export default async function Home() {
  const user = await currentUser();
  const supabase = await createClient();
  const ist = await supabase.from("re_ist").select("id, data").order("id", { ascending: false });

  const rows = (ist.data ?? []) as Ist[];
  const year = String(new Date().getFullYear());
  const thisYear = rows.filter((r) => r.id.startsWith(year));
  const last = rows[0];
  const ytd = thisYear.reduce((s, r) => s + cf(r.data.werte ?? {}), 0);

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Persönlich</div>
          <h1>Dashboard</h1>
        </div>
        <form action="/auth/signout" method="post">
          <span className="muted" style={{ marginRight: 10, fontSize: 12 }}>{user?.email}</span>
          <button className="btn" type="submit">Abmelden</button>
        </form>
      </header>

      <section className="tiles">
        <Link href="/real-estate" className="tile">
          <h2>Real Estate <span>BlueMForest GbR</span></h2>
          <p className="muted" style={{ margin: 0 }}>Mainzer 111 und Mainzer 105 · 4 Wohnungen + Garage</p>
          <div className="stats">
            <div className="stat">
              <div className="l">Letzter Ist-Monat</div>
              <div className="v">{last ? `${MONTHS[+last.id.slice(5) - 1]} ${last.id.slice(0, 4)}` : "–"}</div>
              <div className="s">{last ? <>Cashflow <span className={cf(last.data.werte) < 0 ? "neg" : "pos"}>{eur(cf(last.data.werte))}</span></> : "noch nichts erfasst"}</div>
            </div>
            <div className="stat">
              <div className="l">Cashflow {year}</div>
              <div className={`v ${ytd < 0 ? "neg" : thisYear.length ? "pos" : ""}`}>{thisYear.length ? eur(ytd) : "–"}</div>
              <div className="s">{thisYear.length} von 12 Monaten erfasst</div>
            </div>
          </div>
          <span className="go">Öffnen →</span>
        </Link>

      </section>

      <section>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Direkt zu</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Link className="btn" href="/real-estate#ist">Ist vs. Plan erfassen</Link>
          <Link className="btn" href="/real-estate#fristen">Fristen</Link>
          <Link className="btn" href="/real-estate#rk">Rücklage</Link>
          <Link className="btn" href="/real-estate#fin">Anschlussfinanzierung</Link>
        </div>
      </section>
    </main>
  );
}
