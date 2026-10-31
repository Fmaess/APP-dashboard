# Dashboard

Persönliches Dashboard über die privaten Projekte. Next.js (App Router) auf Vercel, Supabase für Login und Daten. Nur ein Nutzer.

## Module

| Kachel | Route | Inhalt |
|---|---|---|
| Real Estate | `/real-estate` | BlueMForest GbR: Cashflow-Modell, Steuern, Rücklage, Fristen, Ist vs. Plan, Dokumentation |
| Briefing | `/briefing` | Das jeweils neueste Briefing (Markdown), ältere im Archiv |

### Real Estate

Ausgangspunkt ist die bestehende Seite `src/modules/real-estate/bluemforest.html`, unverändert übernommen. Sie wird hinter dem Login unter `/real-estate/app` ausgeliefert und auf `/real-estate` eingebettet.

Die Seite war ein claude.ai-Artifact und nutzt `window.claude.use("db" | "user" | "downloads")`. `src/modules/real-estate/bridge.js` stellt dieselbe Schnittstelle bereit und speichert die Ist-Werte in der Supabase-Tabelle `re_ist`. Änderungen am Modell also direkt in der HTML-Datei machen.

Tabs direkt verlinken: `/real-estate#fristen`, `#ist`, `#rk`, `#fin`, `#verm`, `#tax`, `#plan`, `#doc`.

## Einrichtung

### 1. Supabase

1. **SQL Editor → New query**, Inhalt von `supabase/schema.sql` einfügen, **Run**. Legt `re_ist` und `briefings` mit Row Level Security an.
2. **Authentication → Users → Add user → Create new user**: eigene E-Mail und Passwort, „Auto Confirm User“ anhaken.
3. **Authentication → Sign In / Providers**: „Allow new users to sign up“ **ausschalten**.
4. **Authentication → URL Configuration**: Site URL auf die Vercel-Adresse setzen, sobald sie feststeht.

### 2. Vercel

1. **Add New → Project**, Repo `Fmaess/APP-dashboard` importieren. Framework wird erkannt.
2. Unter **Environment Variables** eintragen (Werte wie in `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key, nie den secret/service_role key)
   - `ALLOWED_EMAIL`
3. **Deploy**. Jeder Push auf `main` deployt danach automatisch.

### Lokal

```bash
cp .env.example .env.local   # Werte eintragen
npm install
npm run dev
```

## Neues Modul anlegen

1. Ordner `src/app/<modul>/` mit `page.tsx`.
2. Tabelle in `supabase/schema.sql` ergänzen, immer mit `user_id` und der Policy „owner only“.
3. Kachel in `src/app/page.tsx` hinzufügen.

## Sicherheit

- `src/proxy.ts` lässt nur angemeldete Nutzer durch und meldet jedes Konto außer `ALLOWED_EMAIL` sofort ab.
- Jede Tabelle ist per RLS auf `user_id = auth.uid()` beschränkt; der Publishable Key allein liest nichts.
