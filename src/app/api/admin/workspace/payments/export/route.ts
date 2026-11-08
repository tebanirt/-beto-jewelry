import { NextResponse } from "next/server";
import { getAdminSession, logActivity } from "@/lib/adminSession";
import { paymentsForMonth, validMonth } from "@/lib/paymentsReport";
import { vueAutorisee } from "@/lib/entite";

/**
 * Month of payments as CSV (opens in Excel / Numbers).
 * By default: the company's sales, cash included — the file for the accountant.
 * `vue=personnel` (sales made before the company) works for Rayane only; any
 * other session always gets the company file, whatever the URL says.
 */
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const month = validMonth(params.get("m"));
  const asked = vueAutorisee(session, params.get("vue"), "societe");
  const vue = asked === "personnel" ? "personnel" : "societe";
  const { rows, error } = await paymentsForMonth(month, vue);
  if (error) return NextResponse.json({ error }, { status: 500 });
  await logActivity(session, "export_paiements", undefined, `${vue === "personnel" ? "Avant la société" : "Société"} · ${month} · ${rows.length} paiements`);

  // Quotes every cell; a leading = + - @ is neutralised so a spreadsheet never runs it as a formula.
  const cell = (v: unknown) => {
    let s = v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [
    // Amount = before taxes (applied to the order); GST/QST collected on top since Nov 6, 2026.
    ["Date", "Client", "Order", "Type", "Method", "Amount before taxes (CAD)", "GST/TPS", "QST/TVQ", "Total received", "Receipt", "Recorded by", "Note"],
    ...rows.map((p) => [
      p.received_at,
      p.order?.client?.full_name,
      p.order?.description,
      p.kind,
      p.method,
      Number(p.amount).toFixed(2),
      Number(p.tps ?? 0).toFixed(2),
      Number(p.tvq ?? 0).toFixed(2),
      (Number(p.amount) + Number(p.tps ?? 0) + Number(p.tvq ?? 0)).toFixed(2),
      p.receipt_number,
      p.recorded_by,
      p.note,
    ]),
  ];
  const csv = "﻿" + lines.map((l) => l.map(cell).join(",")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${vue === "personnel" ? "beto-avant-societe" : "beto-societe"}-${month}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
