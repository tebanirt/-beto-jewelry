"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLang } from "@/hooks/useLang";
import { localizePath } from "@/lib/locale";

type Props = ComponentProps<typeof NextLink>;

/**
 * Lien interne qui garde la langue de la page : sur une page anglaise, « /process »
 * devient « /en/process ». Les liens externes, les fichiers et l'admin ne changent pas.
 */
export default function LocaleLink({ href, ...rest }: Props) {
  const lang = useLang();
  const localized = typeof href === "string" ? localizePath(href, lang) : href;
  return <NextLink href={localized} {...rest} />;
}
