import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Anonymous funnel events (see src/lib/funnel.ts). Everything is validated
 * and bounded here; nothing identifying is stored (no IP, no user agent, no
 * contact details). Always answers 204 so tracking can never affect a visitor.
 */

const EVENTS = new Set([
  "view", "step_view", "choice", "blocked", "image_added", "image_error", "price_shown",
  "submit", "submit_ok", "submit_error", "cta_click", "leave", "deposit_paid",
]);
const FORMS = new Set(["custom-design", "deposit"]);
const SID_RE = /^[A-Za-z0-9-]{8,64}$/;
const KEY_RE = /^[A-Za-z_]{1,30}$/;
const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

function cleanProps(raw: unknown) {
  const out: Record<string, string | number | boolean> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const [k, v] of Object.entries(raw).slice(0, 16)) {
    if (!KEY_RE.test(k)) continue;
    if (typeof v === "string") out[k] = v.slice(0, 80);
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = Math.round(v * 100) / 100;
    else if (typeof v === "boolean") out[k] = v;
  }
  return out;
}

export async function POST(request: Request) {
  const done = new Response(null, { status: 204 });
  try {
    if (BOT_RE.test(request.headers.get("user-agent") ?? "")) return done;
    const text = await request.text();
    if (text.length > 4000) return done;
    const body = JSON.parse(text) as { sid?: unknown; form?: unknown; event?: unknown; step?: unknown; props?: unknown };
    const sid = typeof body.sid === "string" ? body.sid : "";
    const event = typeof body.event === "string" ? body.event : "";
    const form = typeof body.form === "string" && FORMS.has(body.form) ? body.form : "custom-design";
    if (!SID_RE.test(sid) || !EVENTS.has(event)) return done;
    const step = typeof body.step === "number" && Number.isInteger(body.step) && body.step >= 0 && body.step <= 10 ? body.step : null;

    const { error } = await getSupabaseAdmin()
      .from("funnel_events")
      .insert({ session_id: sid, form, event, step, props: cleanProps(body.props) });
    if (error) console.error("funnel_events insert error:", error);
  } catch (err) {
    console.error("track error:", err);
  }
  return done;
}
