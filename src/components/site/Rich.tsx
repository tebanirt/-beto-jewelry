import Link from "next/link";
import { Fragment, type ReactNode } from "react";

const NBSP = " ";

/**
 * Typographie : espaces insécables (règles françaises seulement en français),
 * nombres et codes postaux jamais coupés.
 */
export function typo(text: string, lang: "fr" | "en"): string {
  let s = text
    .replace(/(\d) (?=\d{3}\b)/g, `$1${NBSP}`) // 6 000 $
    .replace(/\b([A-Z]\d[A-Z]) (\d[A-Z]\d)\b/g, `$1${NBSP}$2`) // H3B 0E5
    .replace(/\b(bureau|Suite) (\d+)/g, `$1${NBSP}$2`); // bureau 200
  if (lang === "fr") {
    s = s
      .replace(/ ([:;?!%»])/g, `${NBSP}$1`)
      .replace(/« /g, `«${NBSP}`)
      .replace(/(\d) \$/g, `$1${NBSP}$`)
      .replace(/(\d) (h|min)\b/g, `$1${NBSP}$2`);
  } else {
    s = s.replace(/(\d) (h|a\.m\.|p\.m\.)/g, `$1${NBSP}$2`);
  }
  return s;
}

const COMPOUND = /[\p{L}\p{N}’']+(?:-[\p{L}\p{N}’']+)+/gu;

/** Mots composés (Saint-Laurent, rendez-vous…) jamais coupés au trait d'union. */
function keepCompounds(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(COMPOUND)) {
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    out.push(
      <span key={`${keyBase}-c${i}`} className="whitespace-nowrap">
        {m[0]}
      </span>
    );
    last = i + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function plain(text: string, lang: "fr" | "en", keyBase: string): ReactNode[] {
  const lines = typo(text, lang).split("\n");
  return lines.flatMap((line, li) => [
    ...(li > 0 ? [<br key={`${keyBase}-br${li}`} />] : []),
    ...keepCompounds(line, `${keyBase}-l${li}`),
  ]);
}

const TOKENS = /\[([^\]]+)\]\(([^)]+)\)|\*([^*]+)\*/g;

/**
 * Rend une chaîne du contenu : *italique* et [lien](adresse), avec la
 * typographie de la langue. `emClassName` colore la fin de titre en italique.
 */
export default function Rich({
  text,
  lang,
  emClassName = "",
  linkClassName = "bj-prose-link",
}: {
  text: string;
  lang: "fr" | "en";
  emClassName?: string;
  linkClassName?: string;
}) {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(TOKENS)) {
    const i = m.index ?? 0;
    if (i > last) out.push(...plain(text.slice(last, i), lang, `t${n}`));
    if (m[1] !== undefined && m[2] !== undefined) {
      const href = m[2];
      const label = plain(m[1], lang, `a${n}`);
      out.push(
        href.startsWith("/") ? (
          <Link key={`a${n}`} href={href} className={linkClassName}>
            {label}
          </Link>
        ) : (
          <a key={`a${n}`} href={href} className={linkClassName}>
            {label}
          </a>
        )
      );
    } else if (m[3] !== undefined) {
      out.push(
        <em key={`e${n}`} className={`italic ${emClassName}`}>
          {plain(m[3], lang, `e${n}`)}
        </em>
      );
    }
    last = i + m[0].length;
    n++;
  }
  if (last < text.length) out.push(...plain(text.slice(last), lang, `t${n}`));
  return <Fragment>{out}</Fragment>;
}
