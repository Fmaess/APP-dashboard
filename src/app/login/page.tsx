"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) {
      setError("Anmeldung fehlgeschlagen. E-Mail oder Passwort prüfen.");
      setBusy(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    // Only allow same-site relative paths as redirect target.
    window.location.assign(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
  }

  return (
    <main className="shell" style={{ maxWidth: 420, paddingTop: "12vh" }}>
      <div>
        <div className="eyebrow">Persönlich</div>
        <h1>Dashboard</h1>
      </div>
      <form className="card form" onSubmit={submit}>
        <label>
          E-Mail
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Passwort
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn pri" type="submit" disabled={busy}>{busy ? "Anmelden …" : "Anmelden"}</button>
      </form>
    </main>
  );
}
