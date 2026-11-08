import Link from "next/link";
import AdminShell, { Card, SectionTitle, Stat } from "../AdminShell";
import MonthlyChart from "./MonthlyChart";
import VueToggle from "../VueToggle";
import { getAdminSession } from "@/lib/adminSession";
import { vueAutorisee, type VueVentes } from "@/lib/entite";
import {
  MOIS_EN_COURS,
  OBJECTIF_MOIS_BAS,
  OBJECTIF_MOIS_HAUT,
  OBJECTIF_PAR_PIECE,
  argent,
  loadFinances,
  nomDuMois,
  pourcent,
  variation,
  type Mois,
} from "@/lib/finances";

export const dynamic = "force-dynamic";
export const metadata = { title: "Finances — CRM" };

const ETAPES: Record<string, string> = {
  design: "Design",
  production: "En production",
  ready: "Prête",
  delivered: "Remise",
};

function Variation({ v, inverse = false }: { v: number | null; inverse?: boolean }) {
  if (v === null) return <span className="text-beto-gray-light">—</span>;
  const bon = inverse ? v < 0 : v > 0;
  const signe = v > 0 ? "+" : v < 0 ? "−" : "";
  return (
    <span className={`tabular-nums ${v === 0 ? "text-beto-gray-light" : bon ? "text-emerald-700" : "text-red-700"}`}>
      {signe}
      {Math.abs(Math.round(v))} %
    </span>
  );
}

function Barre({ valeur, max, couleur = "bg-beto-gold" }: { valeur: number; max: number; couleur?: string }) {
  const w = max > 0 ? Math.max(valeur > 0 ? 3 : 0, Math.round((valeur / max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full bg-beto-gray-subtle/70 rounded-full overflow-hidden" aria-hidden>
      <div className={`h-full ${couleur} rounded-full`} style={{ width: `${w}%` }} />
    </div>
  );
}

const SOUS_TITRES: Record<VueVentes, string> = {
  tout: "Ventes, coûts et marges, mois par mois. Montants avant taxes. Données internes : jamais visibles des clients.",
  societe:
    "Ventes de la société seulement (vendues depuis le 6 novembre 2026), comptant compris : c'est ce qui va au comptable. Montants avant taxes.",
  personnel:
    "Ventes faites avant la société (jusqu'au 5 novembre 2026). Visible par toi seulement, hors du rapport de la société. Montants avant taxes.",
};

export default async function FinancesPage({ searchParams }: PageProps<"/admin/finances">) {
  const session = await getAdminSession();
  const estRayane = session?.role === "owner";
  // Décidé côté serveur : une autre session que Rayane voit la société, quoi que dise l'adresse.
  const vue = vueAutorisee(session, (await searchParams).vue);
  const { mois, canaux, ventes, error } = await loadFinances(vue);
  const enCours = MOIS_EN_COURS();

  // Totaux depuis le début.
  const vraies = ventes.filter((v) => !v.echange);
  const ca = vraies.reduce((s, v) => s + (v.prix ?? 0), 0);
  const auCout = vraies.filter((v) => v.prix !== null && v.cout !== null);
  const profitVentes = auCout.reduce((s, v) => s + (v.profit ?? 0), 0);
  const caAuCout = auCout.reduce((s, v) => s + (v.prix ?? 0), 0);
  const coutEchanges = ventes.filter((v) => v.echange).reduce((s, v) => s + (v.cout ?? 0), 0);
  const profitNet = profitVentes - coutEchanges;
  const margePct = caAuCout > 0 ? (profitVentes / caAuCout) * 100 : null;
  const profitMoyen = auCout.length ? profitVentes / auCout.length : null;
  const auObjectif = auCout.filter((v) => (v.profit ?? 0) >= OBJECTIF_PAR_PIECE).length;
  const encaisse = ventes.reduce((s, v) => s + v.paye, 0);
  const aEncaisser = vraies.reduce((s, v) => s + Math.max(0, v.reste ?? 0), 0);
  const sansCout = vraies.filter((v) => v.prix !== null && v.cout === null);
  const sansPrix = vraies.filter((v) => v.prix === null);

  // Ce mois-ci et les mois complets.
  const idx = mois.findIndex((m) => m.mois.slice(0, 7) === enCours.slice(0, 7));
  const courant: Mois | undefined = idx >= 0 ? mois[idx] : undefined;
  const precedent: Mois | undefined = idx > 0 ? mois[idx - 1] : mois.at(-1);
  // Mois complets : ni le mois en cours, ni le tout premier mois (l'entreprise a commencé en cours de mois).
  const premierMois = mois.find((m) => m.ventes > 0 || m.nouveaux_contacts > 0);
  const complets = mois.filter(
    (m) => m.mois.slice(0, 7) !== enCours.slice(0, 7) && m !== premierMois && (m.ventes > 0 || m.nouveaux_contacts > 0)
  );
  const meilleur = complets.reduce<Mois | undefined>((b, m) => (!b || m.profit_connu > b.profit_connu ? m : b), undefined);
  const faible = complets.reduce<Mois | undefined>((b, m) => (!b || m.profit_connu < b.profit_connu ? m : b), undefined);
  const moyenneMensuelle = complets.length ? complets.reduce((s, m) => s + m.profit_connu, 0) / complets.length : null;

  // Provenances.
  const canauxTries = [...canaux].filter((c) => c.canal !== "Échange marketing").sort((a, b) => b.ventes - a.ventes || b.contacts - a.contacts);
  const maxCaCanal = Math.max(0, ...canauxTries.map((c) => c.chiffre_affaires));
  const premier = canauxTries[0];
  const pubs = canaux.find((c) => c.canal === "Pubs Facebook et Instagram");
  const site = canaux.find((c) => c.canal === "Site web");
  const ventesTotal = vraies.length;

  const lignesMois = [...mois].reverse();
  const parCle = new Map(mois.map((m) => [m.mois.slice(0, 7), m]));
  const anDernier = (m: Mois) => {
    const [a, mm] = m.mois.slice(0, 7).split("-");
    return parCle.get(`${Number(a) - 1}-${mm}`);
  };
  const aUnAnDeDonnees = mois.some((m) => anDernier(m));
  const maxProfitMois = Math.max(1, ...mois.map((m) => m.profit_connu));

  return (
    <AdminShell
      active="finances"
      eyebrow={vue === "societe" ? "Société · en direct" : vue === "personnel" ? "Avant la société · Rayane seulement" : "Depuis le début · en direct"}
      title="Finances"
      subtitle={SOUS_TITRES[vue]}
      actions={estRayane ? <VueToggle vue={vue} href={(v) => (v === "tout" ? "/admin/finances" : `/admin/finances?vue=${v}`)} /> : undefined}
    >
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-6">
          Une partie des chiffres n&apos;a pas pu être lue : {error}
        </p>
      )}

      {/* Chiffres clés */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-3">
        <Stat label="Profit net" value={argent(profitNet)} tone="gold" hint={coutEchanges > 0 ? `${argent(profitVentes)} sur les ventes, moins ${argent(coutEchanges)} d'échanges marketing` : "Sur les pièces au coût connu"} />
        <Stat label="Chiffre d'affaires" value={argent(ca)} hint={`${ventesTotal} pièces vendues`} />
        <Stat label="Marge moyenne" value={pourcent(margePct)} hint={`${argent(caAuCout)} de ventes au coût connu`} />
        <Stat
          label="Profit par pièce"
          value={argent(profitMoyen)}
          tone={profitMoyen !== null && profitMoyen >= OBJECTIF_PAR_PIECE ? "good" : "default"}
          hint={`Objectif ${argent(OBJECTIF_PAR_PIECE)} · atteint par ${auObjectif} sur ${auCout.length}`}
        />
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-10">
        <Stat label="Déjà encaissé" value={argent(encaisse)} hint={ca > 0 ? `${Math.round((encaisse / ca) * 100)} % du chiffre d'affaires` : undefined} />
        <Stat label="À encaisser" value={argent(aEncaisser)} hint="Soldes dus à la remise des pièces" />
        <Stat
          label={courant ? `Profit · ${nomDuMois(courant.mois).toLowerCase()}` : "Profit ce mois-ci"}
          value={argent(courant?.profit_connu ?? 0)}
          hint={courant ? `${courant.ventes} vente${courant.ventes > 1 ? "s" : ""} · mois en cours` : "Aucune vente ce mois-ci"}
        />
        <Stat
          label="Profit moyen par mois"
          value={argent(moyenneMensuelle)}
          tone={moyenneMensuelle !== null && moyenneMensuelle >= OBJECTIF_MOIS_BAS ? "good" : "default"}
          hint={`${complets.length} mois complets${premierMois ? ` (sans ${nomDuMois(premierMois.mois).toLowerCase()}, le mois du début)` : ""} · objectif ${argent(OBJECTIF_MOIS_BAS)} à ${argent(OBJECTIF_MOIS_HAUT)}`}
        />
      </div>

      {/* Ce que disent les chiffres */}
      <Card className="px-6 py-5 mb-10">
        <SectionTitle>Ce que disent les chiffres</SectionTitle>
        <ul className="grid gap-2.5 text-sm text-beto-gray leading-relaxed">
          {premier && premier.ventes > 0 && (
            <li>
              <span className="font-medium text-beto-black">{premier.canal}</span> apporte {premier.ventes} ventes sur {ventesTotal} (
              {ca > 0 ? Math.round((premier.chiffre_affaires / ca) * 100) : 0}&nbsp;% du chiffre d&apos;affaires).
            </li>
          )}
          {pubs && pubs.contacts > 0 && (
            <li>
              Les pubs Facebook et Instagram ont amené {pubs.contacts} contacts et {pubs.ventes} vente{pubs.ventes > 1 ? "s" : ""}
              {site && site.contacts > 0 ? `, le site ${site.contacts} contacts et ${site.ventes} vente${site.ventes > 1 ? "s" : ""}` : ""}. La vente en ligne est
              récente : c&apos;est là qu&apos;il y a le plus à gagner.
            </li>
          )}
          {profitMoyen !== null && (
            <li>
              Profit moyen de <span className="font-medium text-beto-black">{argent(profitMoyen)}</span> par pièce : {auObjectif} pièce
              {auObjectif > 1 ? "s" : ""} sur {auCout.length} atteignent l&apos;objectif de {argent(OBJECTIF_PAR_PIECE)}.
            </li>
          )}
          {meilleur && faible && meilleur !== faible && (
            <li>
              Meilleur mois : <span className="font-medium text-beto-black">{nomDuMois(meilleur.mois)}</span> ({argent(meilleur.profit_connu)} de profit). Le plus
              faible : {nomDuMois(faible.mois)} ({argent(faible.profit_connu)}).
            </li>
          )}
          {(sansCout.length > 0 || sansPrix.length > 0) && (
            <li>
              À compléter :{" "}
              {sansCout.length > 0 && <>coût de {sansCout.map((v) => v.client ?? "client").join(", ")}</>}
              {sansCout.length > 0 && sansPrix.length > 0 && " ; "}
              {sansPrix.length > 0 && <>prix de {sansPrix.map((v) => v.client ?? "client").join(", ")}</>}. Sans eux, le profit est sous-estimé.
            </li>
          )}
        </ul>
      </Card>

      {/* Mois par mois */}
      <section className="mb-10" id="mois">
        <SectionTitle note="Survole une barre pour voir le montant exact.">Chiffre d&apos;affaires et profit par mois</SectionTitle>
        <Card className="px-4 pt-5 pb-3">
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-beto-gray px-2 mb-2">
            <span className="flex items-center gap-1.5">
              <i className="inline-block w-3 h-3 rounded-sm bg-[#CFC8BA]" aria-hidden /> Chiffre d&apos;affaires
            </span>
            <span className="flex items-center gap-1.5">
              <i className="inline-block w-3 h-3 rounded-sm bg-beto-gold" aria-hidden /> Profit connu
            </span>
          </div>
          <MonthlyChart mois={mois} enCours={enCours} />
        </Card>
      </section>

      <section className="mb-10">
        <SectionTitle note={aUnAnDeDonnees ? "« vs l'an dernier » compare au même mois de l'année d'avant." : "Dès l'an prochain, chaque mois sera comparé au même mois de l'année d'avant."}>
          Le détail de chaque mois
        </SectionTitle>
        <Card className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="text-left text-xs text-beto-gray-light border-b border-beto-gray-subtle">
                <th className="px-4 py-3 font-medium">Mois</th>
                <th className="px-3 py-3 font-medium text-right">Pièces</th>
                <th className="px-3 py-3 font-medium text-right">Chiffre d&apos;affaires</th>
                <th className="px-3 py-3 font-medium text-right">vs mois d&apos;avant</th>
                {aUnAnDeDonnees && <th className="px-3 py-3 font-medium text-right">vs l&apos;an dernier</th>}
                <th className="px-3 py-3 font-medium text-right">Coûts</th>
                <th className="px-3 py-3 font-medium text-right">Profit</th>
                <th className="px-3 py-3 font-medium text-right">Marge</th>
                <th className="px-3 py-3 font-medium text-right">Par pièce</th>
                <th className="px-3 py-3 font-medium text-right" title="Avant taxes">Encaissé (avant taxes)</th>
                <th className="px-4 py-3 font-medium text-right">Nouveaux contacts</th>
              </tr>
            </thead>
            <tbody>
              {lignesMois.map((m) => {
                const i = mois.indexOf(m);
                const avant = i > 0 ? mois[i - 1] : undefined;
                const caCoutMois = m.couts_connus + m.profit_connu;
                const marge = caCoutMois > 0 ? (m.profit_connu / caCoutMois) * 100 : null;
                const encoursMois = m.mois.slice(0, 7) === enCours.slice(0, 7);
                const estMeilleur = meilleur === m;
                return (
                  <tr key={m.mois} className="border-b border-beto-gray-subtle/60 last:border-0 align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium text-beto-black whitespace-nowrap">
                        {nomDuMois(m.mois)}
                        {estMeilleur && <span className="ml-2 text-[10px] uppercase tracking-wider text-beto-gold-dark border border-beto-gold/60 px-1.5 py-0.5">Meilleur</span>}
                        {encoursMois && <span className="ml-2 text-[10px] uppercase tracking-wider text-beto-gray-light border border-beto-gray-subtle px-1.5 py-0.5">En cours</span>}
                      </div>
                      <div className="mt-1.5 w-28">
                        <Barre valeur={m.profit_connu} max={maxProfitMois} />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">{m.ventes}</td>
                    <td className="px-3 py-3 text-right text-beto-black">{argent(m.chiffre_affaires)}</td>
                    <td className="px-3 py-3 text-right">{encoursMois ? <span className="text-beto-gray-light">en cours</span> : <Variation v={variation(m.chiffre_affaires, avant?.chiffre_affaires)} />}</td>
                    {aUnAnDeDonnees && (
                      <td className="px-3 py-3 text-right">
                        <Variation v={variation(m.chiffre_affaires, anDernier(m)?.chiffre_affaires)} />
                      </td>
                    )}
                    <td className="px-3 py-3 text-right text-beto-gray">{argent(m.couts_connus)}</td>
                    <td className="px-3 py-3 text-right font-medium text-beto-gold-dark">{argent(m.profit_connu)}</td>
                    <td className="px-3 py-3 text-right text-beto-gray">{pourcent(marge)}</td>
                    <td className={`px-3 py-3 text-right ${m.profit_moyen !== null && m.profit_moyen >= OBJECTIF_PAR_PIECE ? "text-emerald-700" : "text-beto-gray"}`}>
                      {argent(m.profit_moyen)}
                    </td>
                    <td className="px-3 py-3 text-right text-beto-gray">
                      {argent(m.encaisse)}
                      {m.tps_percue + m.tvq_percue > 0 && (
                        <div className="text-xs text-beto-gray-light whitespace-nowrap" title="Taxes perçues en plus, à remettre aux gouvernements">
                          + TPS {argent(m.tps_percue)} · TVQ {argent(m.tvq_percue)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-beto-gray">
                      {m.nouveaux_contacts}
                      {m.contacts_pubs > 0 && <div className="text-xs text-beto-gray-light">dont {m.contacts_pubs} des pubs</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
        {precedent && courant && (
          <p className="text-xs text-beto-gray-light mt-2">
            Mois de la vente = mois du premier paiement (le dépôt). Le profit ne compte que les pièces dont le coût est entré ; les échanges marketing sont déduits du
            profit net en haut de page.
          </p>
        )}
      </section>

      {/* Provenances */}
      <section className="mb-10" id="provenances">
        <SectionTitle note="Depuis le début, sans les fiches en double. Marketplace : seuls les clients entrés dans le CRM sont comptés comme contacts.">
          D&apos;où viennent les ventes
        </SectionTitle>
        <Card className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="text-left text-xs text-beto-gray-light border-b border-beto-gray-subtle">
                <th className="px-4 py-3 font-medium">Provenance</th>
                <th className="px-3 py-3 font-medium text-right">Contacts</th>
                <th className="px-3 py-3 font-medium text-right">Ventes</th>
                <th className="px-3 py-3 font-medium text-right">Taux de vente</th>
                <th className="px-3 py-3 font-medium text-right">Chiffre d&apos;affaires</th>
                <th className="px-3 py-3 font-medium text-right">Profit connu</th>
                <th className="px-4 py-3 font-medium text-right">Profit par vente</th>
              </tr>
            </thead>
            <tbody>
              {canauxTries.map((c) => (
                <tr key={c.canal} className="border-b border-beto-gray-subtle/60 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-beto-black">{c.canal}</div>
                    <div className="mt-1.5 w-40">
                      <Barre valeur={c.chiffre_affaires} max={maxCaCanal} couleur="bg-beto-black/80" />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">{c.contacts}</td>
                  <td className="px-3 py-3 text-right font-medium">{c.ventes}</td>
                  <td className="px-3 py-3 text-right text-beto-gray">{c.contacts > 0 ? pourcent((Math.min(c.ventes, c.contacts) / c.contacts) * 100) : "—"}</td>
                  <td className="px-3 py-3 text-right">{argent(c.chiffre_affaires)}</td>
                  <td className="px-3 py-3 text-right text-beto-gold-dark">{argent(c.profit_connu)}</td>
                  <td className="px-4 py-3 text-right text-beto-gray">{c.ventes_cout_connu > 0 ? argent(c.profit_connu / c.ventes_cout_connu) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Chaque vente */}
      <section id="ventes">
        <SectionTitle note={`${ventes.length} commandes, la plus récente en haut.`}>Chaque vente</SectionTitle>
        <Card className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="text-left text-xs text-beto-gray-light border-b border-beto-gray-subtle">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-3 py-3 font-medium">Vendue le</th>
                <th className="px-3 py-3 font-medium">Étape</th>
                <th className="px-3 py-3 font-medium text-right">Prix</th>
                <th className="px-3 py-3 font-medium text-right">Coût</th>
                <th className="px-3 py-3 font-medium text-right">Profit</th>
                <th className="px-3 py-3 font-medium text-right">Marge</th>
                <th className="px-4 py-3 font-medium text-right">Reste à payer</th>
              </tr>
            </thead>
            <tbody>
              {ventes.map((v) => {
                const objectif = v.profit !== null && v.profit >= OBJECTIF_PAR_PIECE;
                return (
                  <tr key={v.commande_id} className="border-b border-beto-gray-subtle/60 last:border-0 align-top">
                    <td className="px-4 py-3 min-w-56">
                      <Link href={`/admin/clients/${v.client_id}`} className="font-medium text-beto-black hover:text-beto-gold-dark">
                        {v.client || "Sans nom"}
                      </Link>
                      <div className="text-xs text-beto-gray-light mt-0.5 max-w-xs">{v.description}</div>
                      <div className="text-[11px] text-beto-gray-light mt-0.5">
                        {v.echange ? "Échange marketing" : v.canal}
                        {vue === "tout" && v.entite === "personnel" && <span className="ml-2 text-beto-gray">· Avant la société</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-beto-gray">
                      {new Date(`${v.vendu_le}T12:00:00Z`).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`text-xs px-2 py-0.5 border ${
                          v.status === "delivered" ? "border-emerald-600/40 text-emerald-700" : v.status === "production" || v.status === "ready" ? "border-beto-gold/60 text-beto-gold-dark" : "border-beto-gray-subtle text-beto-gray"
                        }`}
                      >
                        {ETAPES[v.status] ?? v.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">{v.prix === null ? <span className="text-amber-700 text-xs">à entrer</span> : argent(v.prix)}</td>
                    <td className="px-3 py-3 text-right text-beto-gray">{v.cout === null ? <span className="text-amber-700 text-xs">à entrer</span> : argent(v.cout)}</td>
                    <td className={`px-3 py-3 text-right font-medium ${v.profit !== null && v.profit < 0 ? "text-red-700" : objectif ? "text-emerald-700" : "text-beto-black"}`}>
                      {argent(v.profit)}
                    </td>
                    <td className="px-3 py-3 text-right text-beto-gray">{pourcent(v.marge_pct)}</td>
                    <td className="px-4 py-3 text-right">{v.reste !== null && v.reste > 0 ? argent(v.reste) : <span className="text-beto-gray-light">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
        <p className="text-xs text-beto-gray-light mt-2">
          En vert : profit d&apos;au moins {argent(OBJECTIF_PAR_PIECE)}. Les dépenses de pubs, les logiciels et les taxes ne sont pas encore déduits.
        </p>
      </section>
    </AdminShell>
  );
}
