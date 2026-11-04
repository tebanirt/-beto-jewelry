import { NextResponse } from "next/server";
import { getAdminSession, logActivity } from "@/lib/adminSession";
import { getSupabaseAdmin } from "@/lib/supabase";
import { calculate, loadCalculatorConfig, parseCalcInput } from "@/lib/ringCalculator";

const OUTCOMES = ["pending", "accepted", "too_expensive", "no_answer", "other"] as const;

/**
 * POST { stone, carat, metal, options }            → price, floor, cost breakdown
 * POST { …same, log: { offeredPrice, lang, clientId?, note? } } → also records the quote
 * PATCH { id, outcome, note? }                     → what the client said
 * Every quote given to a client is kept, so prices can be checked against real
 * costs and improved over time.
 */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = (await request.json()) as Record<string, unknown>;
  const input = parseCalcInput(body);
  if ("error" in input) return NextResponse.json({ error: input.error }, { status: 400 });

  const cfg = await loadCalculatorConfig();
  if (!cfg) return NextResponse.json({ error: "The price settings are unavailable — ask Rayane for this price." }, { status: 503 });
  const result = calculate(cfg, input);

  const log = body.log as { offeredPrice?: unknown; lang?: unknown; clientId?: unknown; note?: unknown } | undefined;
  if (!log) return NextResponse.json(result);

  const offered = Math.round(Number(log.offeredPrice));
  if (!Number.isFinite(offered) || offered <= 0) return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  if (offered < result.floor) {
    return NextResponse.json({ error: `That's below the minimum (${result.floor} $). Ask Rayane before going lower.` }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("quotes")
    .insert({
      created_by: session.name,
      client_id: typeof log.clientId === "string" && log.clientId ? log.clientId : null,
      stone: input.stone,
      carat: input.carat,
      metal: input.metal,
      options: input.options,
      cost: result.cost,
      target_price: result.price,
      floor_price: result.floor,
      offered_price: offered,
      lang: log.lang === "fr" ? "fr" : "en",
      note: typeof log.note === "string" ? log.note.trim() || null : null,
      config_snapshot: cfg,
    })
    .select("id")
    .single();
  if (error) {
    console.error("quote insert error:", error);
    return NextResponse.json({ error: "The quote was not saved. Try again." }, { status: 500 });
  }
  await logActivity(session, "quote_given", { type: "quote", id: data.id }, `${input.carat} ct ${input.metal} → ${offered}`);
  return NextResponse.json({ ...result, quoteId: data.id });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const body = (await request.json()) as { id?: string; outcome?: string; note?: string };
  if (!body.id || !OUTCOMES.includes(body.outcome as (typeof OUTCOMES)[number])) {
    return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  }
  const update: Record<string, string> = { outcome: body.outcome as string };
  if (typeof body.note === "string" && body.note.trim()) update.note = body.note.trim();
  const { error } = await getSupabaseAdmin().from("quotes").update(update).eq("id", body.id);
  if (error) {
    console.error("quote outcome error:", error);
    return NextResponse.json({ error: "Not saved. Try again." }, { status: 500 });
  }
  await logActivity(session, "quote_outcome", { type: "quote", id: body.id }, body.outcome);
  return NextResponse.json({ success: true });
}
