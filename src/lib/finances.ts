import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Finances du CRM, lues dans les vues Supabase v_mois, v_canaux et v_ventes
 * (migration « vues_finances_par_mois »). Ces vues sont la seule définition
 * des chiffres : la page Finances, les tableaux de bord et les agents lisent
 * les mêmes. Données internes — jamais visibles des clients.
 */

/** Objectifs fixés par Rayane : ~1 000 $ de profit par pièce, 10 000 à 15 000 $ par mois. */
export const OBJECTIF_PAR_PIECE = 1000;
export const OBJECTIF_MOIS_BAS = 10000;
export const OBJECTIF_MOIS_HAUT = 15000;

export type Mois = {
  mois: string; // AAAA-MM-01
  nouveaux_contacts: number;
  contacts_pubs: number;
  contacts_site: number;
  contacts_marketplace: number;
  ventes: number;
  chiffre_affaires: number;
  couts_connus: number;
  profit_connu: number;
  ventes_cout_connu: number;
  profit_moyen: number | null;
  panier_moyen: number | null;
  cout_echanges: number;
  encaisse: number;
};

export type Canal = {
  canal: string;
  contacts: number;
  ventes: number;
  chiffre_affaires: number;
  profit_connu: number;
  ventes_cout_connu: number;
};

export type Vente = {
  commande_id: string;
  client_id: string;
  client: string | null;
  canal: string;
  owner: string | null;
  description: string | null;
  status: string;
  prix: number | null;
  cout: number | null;
  profit: number | null;
  marge_pct: number | null;
  paye: number;
  reste: number | null;
  vendu_le: string;
  echange: boolean;
};

const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
const n0 = (v: unknown) => Number(v ?? 0);

export async function loadFinances(): Promise<{ mois: Mois[]; canaux: Canal[]; ventes: Vente[]; error: string | null }> {
  try {
    const supabase = getSupabaseAdmin();
    const [m, c, v] = await Promise.all([
      supabase.from("v_mois").select("*").order("mois"),
      supabase.from("v_canaux").select("*"),
      supabase.from("v_ventes").select("*").order("vendu_le", { ascending: false }),
    ]);
    const error = m.error?.message ?? c.error?.message ?? v.error?.message ?? null;
    const mois: Mois[] = (m.data ?? []).map((r) => ({
      mois: String(r.mois),
      nouveaux_contacts: n0(r.nouveaux_contacts),
      contacts_pubs: n0(r.contacts_pubs),
      contacts_site: n0(r.contacts_site),
      contacts_marketplace: n0(r.contacts_marketplace),
      ventes: n0(r.ventes),
      chiffre_affaires: n0(r.chiffre_affaires),
      couts_connus: n0(r.couts_connus),
      profit_connu: n0(r.profit_connu),
      ventes_cout_connu: n0(r.ventes_cout_connu),
      profit_moyen: num(r.profit_moyen),
      panier_moyen: num(r.panier_moyen),
      cout_echanges: n0(r.cout_echanges),
      encaisse: n0(r.encaisse),
    }));
    const canaux: Canal[] = (c.data ?? []).map((r) => ({
      canal: String(r.canal),
      contacts: n0(r.contacts),
      ventes: n0(r.ventes),
      chiffre_affaires: n0(r.chiffre_affaires),
      profit_connu: n0(r.profit_connu),
      ventes_cout_connu: n0(r.ventes_cout_connu),
    }));
    const ventes: Vente[] = (v.data ?? []).map((r) => ({
      commande_id: String(r.commande_id),
      client_id: String(r.client_id),
      client: r.client ?? null,
      canal: String(r.canal),
      owner: r.owner ?? null,
      description: r.description ?? null,
      status: String(r.status),
      prix: num(r.prix),
      cout: num(r.cout),
      profit: num(r.profit),
      marge_pct: num(r.marge_pct),
      paye: n0(r.paye),
      reste: num(r.reste),
      vendu_le: String(r.vendu_le),
      echange: Boolean(r.echange),
    }));
    return { mois, canaux, ventes, error };
  } catch (err) {
    return { mois: [], canaux: [], ventes: [], error: err instanceof Error ? err.message : "Supabase indisponible" };
  }
}

const fmtMoney = new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
export const argent = (n: number | null | undefined) => (n === null || n === undefined ? "—" : fmtMoney.format(n));
export const pourcent = (n: number | null | undefined, digits = 0) =>
  n === null || n === undefined || !Number.isFinite(n) ? "—" : `${n.toLocaleString("fr-CA", { maximumFractionDigits: digits })} %`;

/** « novembre 2026 » à partir de « 2026-11-01 ». */
export function nomDuMois(mois: string, style: "long" | "short" = "long") {
  const d = new Date(`${mois.slice(0, 7)}-15T12:00:00Z`);
  const s = d.toLocaleDateString("fr-CA", { month: style, year: "numeric", timeZone: "UTC" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Variation en % d'un mois à l'autre ; null si le mois d'avant est à zéro. */
export function variation(actuel: number, avant: number | null | undefined) {
  if (avant === null || avant === undefined || avant === 0) return null;
  return ((actuel - avant) / avant) * 100;
}

export const MOIS_EN_COURS = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit" }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  return `${y}-${m}-01`;
};
