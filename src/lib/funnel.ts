/**
 * Anonymous funnel tracking for the lead forms: which step people reach,
 * where they get blocked, where they leave. No name, email, phone, IP or
 * cookie: only a random id kept for the browser tab (sessionStorage).
 * Events go to /api/track, which stores them in Supabase (funnel_events).
 */

export type FunnelEvent =
  | "view"
  | "step_view"
  | "choice"
  | "blocked"
  | "image_added"
  | "image_error"
  | "price_shown"
  | "submit"
  | "submit_ok"
  | "submit_error"
  | "cta_click"
  | "leave"
  | "deposit_paid";

type Props = Record<string, string | number | boolean>;

const SID_KEY = "beto-funnel-sid";
let memorySid = "";
let baseContext: Props | null = null;

function sessionId() {
  try {
    let sid = window.sessionStorage.getItem(SID_KEY);
    if (!sid) {
      sid = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      window.sessionStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    if (!memorySid) memorySid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    return memorySid;
  }
}

/** Where the visit came from, without anything that identifies the person. */
function context(): Props {
  if (baseContext) return baseContext;
  const ctx: Props = {};
  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    const utmCampaign = params.get("utm_campaign");
    if (utmSource) ctx.src = utmSource.slice(0, 40);
    else if (params.has("fbclid")) ctx.src = "facebook";
    else if (params.has("gclid")) ctx.src = "google-ads";
    else if (document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      ctx.src = host === window.location.hostname.replace(/^www\./, "") ? "site" : host.slice(0, 40);
    } else ctx.src = "direct";
    if (utmCampaign) ctx.campaign = utmCampaign.slice(0, 60);
    ctx.device = window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
    ctx.lang = (navigator.language || "").slice(0, 2).toLowerCase();
  } catch {
    // keep what we have
  }
  baseContext = ctx;
  return ctx;
}

export function trackFunnel(event: FunnelEvent, step?: number, props: Props = {}, form = "custom-design") {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ sid: sessionId(), form, event, step, props: { ...context(), ...props } });
    if (navigator.sendBeacon && navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }))) return;
    void fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  } catch {
    // tracking must never break the form
  }
}
