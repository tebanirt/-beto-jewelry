"use client";

import { usePathname } from "next/navigation";

/**
 * The private CRM (/admin) is a work tool on a phone: no site menu, footer,
 * cookie banner or analytics there (staff pages are never measured).
 */
export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return children;
}
