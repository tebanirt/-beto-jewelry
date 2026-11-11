import { OBJECTIF_MOIS_BAS, argent, nomDuMois, type Mois } from "@/lib/finances";

const milliers = (n: number) => `${(Math.round(n / 100) / 10).toLocaleString("fr-CA")} k`;

/**
 * Chiffre d'affaires et profit par mois, dessiné côté serveur en SVG (aucun
 * JavaScript dans le navigateur). La ligne pointillée est l'objectif de profit
 * mensuel. Le mois en cours est plus pâle : il n'est pas fini.
 */
export default function MonthlyChart({ mois, enCours }: { mois: Mois[]; enCours: string }) {
  if (mois.length === 0) return <p className="text-sm text-beto-gray-light px-5 py-10">Pas encore de ventes.</p>;

  const W = 960;
  const H = 330;
  const ml = 70;
  const mr = 20;
  const mt = 30;
  const mb = 44;
  const plus = Math.max(OBJECTIF_MOIS_BAS, ...mois.map((m) => m.chiffre_affaires));
  const pas = plus > 30000 ? 10000 : 5000;
  const haut = Math.ceil((plus * 1.08) / pas) * pas;
  const ticks = Array.from({ length: haut / pas + 1 }, (_, i) => i * pas);
  const y = (v: number) => mt + (H - mt - mb) * (1 - v / haut);
  const bande = (W - ml - mr) / mois.length;
  const bw = Math.min(30, bande * 0.3);
  const ecart = Math.min(6, bande * 0.06);
  const avecChiffres = bande >= 64;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px] h-auto" role="img" aria-label="Chiffre d'affaires et profit par mois">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={ml} x2={W - mr} y1={y(t)} y2={y(t)} stroke={t === 0 ? "#BDB8AE" : "#ECEAE5"} strokeWidth={1} />
            <text x={ml - 10} y={y(t)} dy="0.32em" textAnchor="end" fontSize={12} fill="#888888" className="tabular-nums">
              {argent(t)}
            </text>
          </g>
        ))}

        <line x1={ml} x2={W - mr} y1={y(OBJECTIF_MOIS_BAS)} y2={y(OBJECTIF_MOIS_BAS)} stroke="#111111" strokeWidth={1.25} strokeDasharray="5 5" />
        <text x={W - mr} y={y(OBJECTIF_MOIS_BAS) - 8} textAnchor="end" fontSize={12} fontWeight={600} fill="#111111">
          Objectif de profit : {argent(OBJECTIF_MOIS_BAS)} par mois
        </text>

        {mois.map((m, i) => {
          const cx = ml + bande * i + bande / 2;
          const enCoursMois = m.mois.slice(0, 7) === enCours.slice(0, 7);
          const op = enCoursMois ? 0.45 : 1;
          const xCa = cx - bw - ecart / 2;
          const xPr = cx + ecart / 2;
          const profit = Math.max(0, m.profit_connu);
          return (
            <g key={m.mois}>
              <rect x={xCa} y={y(m.chiffre_affaires)} width={bw} height={y(0) - y(m.chiffre_affaires)} fill="#CFC8BA" opacity={op} rx={2}>
                <title>{`${nomDuMois(m.mois)} — chiffre d'affaires : ${argent(m.chiffre_affaires)} (${m.ventes} vente${m.ventes > 1 ? "s" : ""})`}</title>
              </rect>
              <rect x={xPr} y={y(profit)} width={bw} height={y(0) - y(profit)} fill="#C9A86A" opacity={op} rx={2}>
                <title>{`${nomDuMois(m.mois)} — profit connu : ${argent(m.profit_connu)}`}</title>
              </rect>
              {avecChiffres && m.chiffre_affaires > 0 && (
                <text x={xCa + bw / 2} y={y(m.chiffre_affaires) - 6} textAnchor="middle" fontSize={11} fill="#444444" opacity={op}>
                  {milliers(m.chiffre_affaires)}
                </text>
              )}
              {avecChiffres && profit > 0 && (
                <text x={xPr + bw / 2} y={y(profit) - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="#A88840" opacity={op}>
                  {milliers(profit)}
                </text>
              )}
              <text x={cx} y={H - mb + 20} textAnchor="middle" fontSize={12} fill={enCoursMois ? "#888888" : "#444444"}>
                {nomDuMois(m.mois, "short").replace(".", "")}
              </text>
              {enCoursMois && (
                <text x={cx} y={H - mb + 36} textAnchor="middle" fontSize={11} fill="#888888">
                  en cours
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
