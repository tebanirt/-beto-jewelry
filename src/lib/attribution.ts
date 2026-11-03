/**
 * Where a website lead came from (ad, search, other site), so Rayane sees in
 * the CRM which ads bring real clients, the same way as the Facebook instant
 * form leads (column `attribution`).
 *
 * The first page of the visit is remembered for the browser tab only
 * (sessionStorage, no cookie). A visitor who lands on the home page from an
 * ad and then opens the form keeps the ad as the source. A new ad click in
 * the same tab replaces it.
 *
 * Meta ads should carry these URL parameters (Ads Manager, "URL parameters"):
 *   utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.name}}
 */

export type Attribution = {
  /** utm_source, or "facebook"/"google-ads" from the click id, or the referring site, or "direct". */
  source: string;
  medium?: string;
  campaign?: string;
  /** Meta ad set (utm_term). */
  adset?: string;
  /** Meta ad (utm_content). */
  ad?: string;
  /** First page of the visit (path only, no query string). */
  landing?: string;
};

const KEY = "beto-attribution-v1";
const MAX = { source: 40, medium: 40, campaign: 150, adset: 150, ad: 150, landing: 120 } as const;

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return undefined;
  const v = value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max);
  return v || undefined;
}

function fromLocation(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const ownHost = window.location.hostname.replace(/^www\./, "");
  let source = clean(params.get("utm_source"), MAX.source);
  if (!source && params.has("fbclid")) source = "facebook";
  if (!source && params.has("gclid")) source = "google-ads";
  if (!source && document.referrer) {
    try {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      source = host === ownHost ? "site" : clean(host, MAX.source);
    } catch {
      // unreadable referrer: treated as direct
    }
  }
  return {
    source: source || "direct",
    medium: clean(params.get("utm_medium"), MAX.medium),
    campaign: clean(params.get("utm_campaign"), MAX.campaign),
    adset: clean(params.get("utm_term"), MAX.adset),
    ad: clean(params.get("utm_content"), MAX.ad),
    landing: clean(window.location.pathname, MAX.landing),
  };
}

/** Called on every page view (see AttributionCapture in the root layout). */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const adClick = params.has("utm_source") || params.has("fbclid") || params.has("gclid");
    const stored = window.sessionStorage.getItem(KEY);
    if (stored && !adClick) return;
    const current = fromLocation();
    // A page opened from another page of the site is not a new source.
    if (!stored && current.source === "site") current.source = "direct";
    window.sessionStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // storage blocked (private mode, in-app browser): getAttribution falls back to the current page
  }
}

/** The visit's source, or the current page's when nothing was stored. */
export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.sessionStorage.getItem(KEY);
    if (stored) return parseAttribution(JSON.parse(stored));
  } catch {
    // fall through
  }
  try {
    return fromLocation();
  } catch {
    return null;
  }
}

/** Never trusts the browser: keeps known keys only, as short plain strings. */
export function parseAttribution(raw: unknown): Attribution | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const source = clean(r.source, MAX.source);
  if (!source) return null;
  return {
    source,
    medium: clean(r.medium, MAX.medium),
    campaign: clean(r.campaign, MAX.campaign),
    adset: clean(r.adset, MAX.adset),
    ad: clean(r.ad, MAX.ad),
    landing: clean(r.landing, MAX.landing),
  };
}

/**
 * One line for the email and the CRM, e.g.
 * "Site web · facebook (paid) · BETO | WEBSITE BOOKING | OCT 2026 | V1 / <ad set> / <ad> · arrivée : /"
 * Meta names keep their own order: campaign / ad set / ad.
 */
export function formatAttribution(a: Attribution) {
  const meta = [a.campaign, a.adset, a.ad].filter(Boolean).join(" / ");
  return [
    "Site web",
    a.medium ? `${a.source} (${a.medium})` : a.source,
    meta || null,
    a.landing ? `arrivée : ${a.landing}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
