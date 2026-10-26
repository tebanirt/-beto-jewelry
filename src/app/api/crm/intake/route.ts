import { NextResponse } from "next/server";
import { Resend } from "resend";
import { recordSubmission, upsertClient } from "@/lib/supabase";
import { escapeHtml } from "@/lib/escapeHtml";

const TO_EMAIL = process.env.CONTACT_EMAIL || "betojewlz@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, notes } = body as {
      fullName?: string;
      email?: string;
      phone?: string;
      notes?: string;
    };

    if (!fullName || !email || !phone) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const client = await upsertClient({ fullName, email, phone, source: "intake-link" });
    await recordSubmission({
      clientId: client?.id ?? null,
      formType: "intake-link",
      fields: { "Nom complet": fullName, Courriel: email, Téléphone: phone, Notes: notes || "" },
    });

    // Best-effort notification email: the lead is already saved in the CRM
    // above, so a Resend hiccup here must never make the visitor think their
    // submission failed.
    try {
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Beto Jewelry <noreply@betojewelry.com>",
          to: TO_EMAIL,
          replyTo: email,
          subject: `Nouveau client (lien d'inscription) — ${escapeHtml(fullName)}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#111;border-bottom:2px solid #C9A86A;padding-bottom:12px;">Nouveau client via le lien d'inscription</h2>
            <table style="width:100%;border-collapse:collapse;margin-top:16px;">
              <tr><td style="padding:8px 12px;font-weight:600;color:#444;border-bottom:1px solid #eee;">Nom</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(fullName)}</td></tr>
              <tr><td style="padding:8px 12px;font-weight:600;color:#444;border-bottom:1px solid #eee;">Courriel</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(email)}</td></tr>
              <tr><td style="padding:8px 12px;font-weight:600;color:#444;border-bottom:1px solid #eee;">Téléphone</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(phone)}</td></tr>
              ${notes ? `<tr><td style="padding:8px 12px;font-weight:600;color:#444;">Notes</td><td style="padding:8px 12px;">${escapeHtml(notes).replace(/\n/g, "<br/>")}</td></tr>` : ""}
            </table>
            <p style="color:#888;font-size:12px;margin-top:24px;">Ajouté automatiquement au CRM. N'oublie pas de lui envoyer sa facture.</p>
          </div>`,
        });
      }
    } catch (emailError) {
      console.error("CRM intake — email notification failed:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CRM intake error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
