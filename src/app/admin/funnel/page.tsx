import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Where visitors of « Commencer mon design » stop, and why. Built on the
 * anonymous events of /api/track (table funnel_events). Protected by the
 * admin session like /admin/clients (see src/proxy.ts).
 */

type Row = { session_id: string; form: string; event: string; step: number | null; props: Record<string, unknown>; created_at: string };

const STEP_NAMES = ["Projet", "Détails", "Estimation", "Coordonnées"];
const FIELD_NAMES: Record<string, string> = {
  project: "Type de projet", stone: "Pierre", labColor: "Couleur du labo", gemType: "Pierre précieuse", birthMonths: "Pierres de naissance", carat: "Carat", ringStyle: "Style",
  metalColor: "Couleur du métal", karat: "Carat de l'or", budget: "Budget", fullName: "Nom", email: "Courriel", phone: "Téléphone",
};

async function loadEvents(days: number): Promise<{ rows: Row[]; error: string | null }> {
  try {
    const supabase = getSupabaseAdmin();
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const rows: Row[] = [];
    for (let page = 0; page < 30; page++) {
      const { data, error } = await supabase
        .from("funnel_events")
        .select("session_id,form,event,step,props,created_at")
        .gte("created_at", since)
        .order("id", { ascending: true })
        .range(page * 1000, page * 1000 + 999);
      if (error) return { rows, error: error.message };
      rows.push(...((data ?? []) as Row[]));
      if (!data || data.length < 1000) break;
    }
    return { rows, error: null };
  } catch (err) {
    return { rows: [], error: err instanceof Error ? err.message : "Supabase indisponible" };
  }
}

const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

function Bar({ value, max }: { value: number; max: number }) {
  const w = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 bg-beto-gray-subtle/60 w-full" aria-hidden>
      <div className="h-full bg-beto-gold" style={{ width: `${w}%` }} />
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  if (rows.length === 0) return <p className="text-sm text-beto-gray">Pas encore de données.</p>;
  return (
    <div className="bg-beto-white border border-beto-gray-subtle/60 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-beto-gray border-b border-beto-gray-subtle/60">
            {head.map((h, i) => (
              <th key={h} className={`px-4 py-3 font-medium ${i > 0 ? "text-right" : ""}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r[0])} className="border-b border-beto-gray-subtle/40 last:border-0">
              {r.map((c, i) => (
                <td key={i} className={`px-4 py-2.5 ${i > 0 ? "text-right tabular-nums" : ""}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminFunnelPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days: daysParam } = await searchParams;
  const days = [7, 30, 90].includes(Number(daysParam)) ? Number(daysParam) : 30;
  const { rows, error } = await loadEvents(days);

  // One record per visit (browser tab).
  type Visit = { maxStep: number; submitted: boolean; calendly: boolean; deposit: boolean; src: string; device: string; leftAt: number | null };
  const visits = new Map<string, Visit>();
  const blocked = new Map<string, number>();
  const projects = new Map<string, number>();
  const modes = new Map<string, number>();
  const prices: number[] = [];
  let depositsPaid = 0;

  for (const r of rows) {
    if (r.form === "deposit") {
      if (r.event === "deposit_paid") depositsPaid++;
      continue;
    }
    let v = visits.get(r.session_id);
    if (!v) {
      v = { maxStep: 0, submitted: false, calendly: false, deposit: false, src: String(r.props?.src ?? "inconnu"), device: String(r.props?.device ?? "?"), leftAt: null };
      visits.set(r.session_id, v);
    }
    if (r.event === "step_view" && r.step !== null && r.step <= 3) v.maxStep = Math.max(v.maxStep, r.step);
    if (r.event === "submit_ok") v.submitted = true;
    if (r.event === "cta_click" && r.props?.target === "calendly") v.calendly = true;
    if (r.event === "cta_click" && r.props?.target === "deposit") v.deposit = true;
    if (r.event === "leave" && r.step !== null) v.leftAt = r.step;
    if (r.event === "blocked" && typeof r.props?.fields === "string") {
      for (const f of r.props.fields.split(",")) blocked.set(f, (blocked.get(f) ?? 0) + 1);
    }
    if (r.event === "choice" && r.props?.field === "project") {
      const p = String(r.props.value);
      projects.set(p, (projects.get(p) ?? 0) + 1);
    }
    if (r.event === "price_shown") {
      const m = String(r.props?.mode ?? "?");
      modes.set(m, (modes.get(m) ?? 0) + 1);
      if (typeof r.props?.price === "number" && r.props.price > 0) prices.push(r.props.price);
    }
  }

  const all = [...visits.values()];
  const total = all.length;
  const reached = [0, 1, 2, 3].map((s) => all.filter((v) => v.maxStep >= s).length);
  const submitted = all.filter((v) => v.submitted).length;
  const calendly = all.filter((v) => v.calendly).length;
  const deposit = all.filter((v) => v.deposit).length;
  const funnel: [string, number][] = [
    ...STEP_NAMES.map((n, i) => [`${i + 1}. ${n}`, reached[i]] as [string, number]),
    ["Demande envoyée", submitted],
    ["Clic « Choisir mon moment »", calendly],
    ["Clic « Payer le dépôt »", deposit],
  ];
  const leftNotSubmitted = all.filter((v) => !v.submitted);
  const leaveByStep = STEP_NAMES.map((n, i) => [`${i + 1}. ${n}`, leftNotSubmitted.filter((v) => v.maxStep === i).length] as [string, number]);
  const bySource = new Map<string, { n: number; ok: number }>();
  const byDevice = new Map<string, { n: number; ok: number }>();
  for (const v of all) {
    const s = bySource.get(v.src) ?? { n: 0, ok: 0 };
    s.n++; if (v.submitted) s.ok++; bySource.set(v.src, s);
    const d = byDevice.get(v.device) ?? { n: 0, ok: 0 };
    d.n++; if (v.submitted) d.ok++; byDevice.set(v.device, d);
  }
  const sortDesc = <T,>(m: Map<string, T>, key: (t: T) => number) => [...m.entries()].sort((a, b) => key(b[1]) - key(a[1]));
  const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  const money = (n: number) => new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n);

  return (
    <section className="min-h-screen bg-beto-offwhite px-5 py-10" style={{ paddingTop: "calc(var(--nav-height, 0px) + 2.5rem)" }}>
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-label text-beto-gold-dark mb-1">Beto Jewelry</p>
            <h1 className="text-2xl font-medium text-beto-black">Formulaire « Commencer mon design »</h1>
            <p className="text-sm text-beto-gray mt-1">Où les visiteurs s&apos;arrêtent, sur les {days} derniers jours. Données anonymes.</p>
          </div>
          <nav className="flex gap-2 text-xs">
            {[7, 30, 90].map((d) => (
              <Link key={d} href={`/admin/funnel?days=${d}`} className={`px-3 py-1.5 border ${d === days ? "border-beto-black bg-beto-black text-white" : "border-beto-gray-subtle text-beto-gray hover:text-beto-black"}`}>
                {d} jours
              </Link>
            ))}
            <Link href="/admin/clients" className="px-3 py-1.5 border border-beto-gray-subtle text-beto-gray hover:text-beto-black">Clients</Link>
          </nav>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">Lecture impossible : {error}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ["Visites du formulaire", String(total)],
            ["Demandes envoyées", `${submitted} (${pct(submitted, total)} %)`],
            ["Clics réservation", `${calendly} (${pct(calendly, submitted)} % des demandes)`],
            ["Dépôts payés", String(depositsPaid)],
          ].map(([k, v]) => (
            <div key={k} className="bg-beto-white border border-beto-gray-subtle/60 px-4 py-3">
              <p className="text-xs text-beto-gray">{k}</p>
              <p className="text-lg font-medium text-beto-black tabular-nums mt-1">{v}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-beto-black">Entonnoir</h2>
          <div className="bg-beto-white border border-beto-gray-subtle/60 divide-y divide-beto-gray-subtle/40">
            {funnel.map(([label, n], i) => {
              const prev = i === 0 ? n : funnel[i - 1][1];
              return (
                <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1.5 px-4 py-3">
                  <span className="text-sm text-beto-black">{label}</span>
                  <span className="text-sm tabular-nums text-right">
                    {n} <span className="text-beto-gray">· {pct(n, total)} % des visites{i > 0 ? ` · ${pct(prev - n, prev)} % de perte` : ""}</span>
                  </span>
                  <div className="col-span-2"><Bar value={n} max={total} /></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-3 min-w-0">
            <h2 className="text-sm font-medium uppercase tracking-wide text-beto-black">Dernière étape avant de partir</h2>
            <p className="text-xs text-beto-gray">Visites sans demande envoyée, selon l&apos;étape la plus loin atteinte.</p>
            <Table head={["Étape", "Visites"]} rows={leaveByStep} />
          </div>
          <div className="flex flex-col gap-3 min-w-0">
            <h2 className="text-sm font-medium uppercase tracking-wide text-beto-black">Questions qui bloquent</h2>
            <p className="text-xs text-beto-gray">Fois où « Continuer » a montré une erreur sur ce champ.</p>
            <Table head={["Champ", "Fois"]} rows={sortDesc(blocked, (n) => n).map(([f, n]) => [FIELD_NAMES[f] ?? f, n])} />
          </div>
          <div className="flex flex-col gap-3 min-w-0">
            <h2 className="text-sm font-medium uppercase tracking-wide text-beto-black">Provenance</h2>
            <Table head={["Source", "Visites", "Demandes"]} rows={sortDesc(bySource, (s) => s.n).map(([k, s]) => [k, s.n, `${s.ok} (${pct(s.ok, s.n)} %)`])} />
          </div>
          <div className="flex flex-col gap-3 min-w-0">
            <h2 className="text-sm font-medium uppercase tracking-wide text-beto-black">Appareil</h2>
            <Table head={["Appareil", "Visites", "Demandes"]} rows={sortDesc(byDevice, (s) => s.n).map(([k, s]) => [k === "mobile" ? "Cellulaire" : k === "desktop" ? "Ordinateur" : k, s.n, `${s.ok} (${pct(s.ok, s.n)} %)`])} />
          </div>
          <div className="flex flex-col gap-3 min-w-0">
            <h2 className="text-sm font-medium uppercase tracking-wide text-beto-black">Type de projet choisi</h2>
            <Table head={["Projet", "Choix"]} rows={sortDesc(projects, (n) => n)} />
          </div>
          <div className="flex flex-col gap-3 min-w-0">
            <h2 className="text-sm font-medium uppercase tracking-wide text-beto-black">Estimation affichée</h2>
            <Table
              head={["Réponse", "Fois"]}
              rows={sortDesc(modes, (n) => n).map(([m, n]) => [m === "price" ? "Prix affiché" : m === "hour" ? "Prix en moins d'1 h" : m === "day" ? "Soumission 24 h" : m, n])}
            />
            {avgPrice > 0 && <p className="text-xs text-beto-gray">Prix moyen affiché : {money(avgPrice)}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
