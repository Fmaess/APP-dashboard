import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/supabase/server";

// Serves the original BlueMForest page (src/modules/real-estate/bluemforest.html)
// behind the login, with the Supabase bridge injected before the page's own script.
export const dynamic = "force-dynamic";

const dir = path.join(process.cwd(), "src/modules/real-estate");

export async function GET() {
  if (!(await currentUser())) return new NextResponse("Unauthorized", { status: 401 });

  const [html, bridge] = await Promise.all([
    readFile(path.join(dir, "bluemforest.html"), "utf8"),
    readFile(path.join(dir, "bridge.js"), "utf8"),
  ]);
  const i = html.indexOf("<script>");
  const out = i >= 0
    ? html.slice(0, i) + `<script>${bridge}</script>\n` + html.slice(i)
    : html.replace("</body>", `<script>${bridge}</script></body>`);

  return new NextResponse(out, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": "frame-ancestors 'self'",
      "X-Robots-Tag": "noindex",
    },
  });
}
