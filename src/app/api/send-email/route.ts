import { NextResponse } from "next/server";
import { Resend } from "resend";
import { recordSubmission, upsertClient } from "@/lib/supabase";

const TO_EMAIL = process.env.CONTACT_EMAIL || "betojewlz@gmail.com";

function extractContact(fields: Record<string, string>) {
  const fullName =
    fields["Nom complet"] ||
    [fields["Prénom"], fields["Nom"]].filter(Boolean).join(" ") ||
    undefined;
  const email = fields["Courriel"] || fields.email || undefined;
  const phone = fields["Téléphone"] || undefined;
  return { fullName, email, phone };
}

const FORM_LABELS: Record<string, string> = {
  contact: "Nouveau message — Formulaire de contact",
  "custom-design": "Nouvelle demande — Design sur mesure ($200 dépôt)",
  consultation: "Nouvelle demande — Consultation",
  quote: "Nouvelle demande — Devis",
};

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await request.json();
    const { formType, fields } = body as { formType: string; fields: Record<string, string> };

    if (!formType || !fields) {
      return NextResponse.json({ error: "Missing formType or fields" }, { status: 400 });
    }

    const subject = FORM_LABELS[formType] || `Nouvelle demande — ${formType}`;

    const rows = Object.entries(fields)
      .filter(([, value]) => value && value.toString().trim().length > 0)
      .map(
        ([key, value]) =>
          `<tr><td style="padding:8px 12px;font-weight:600;color:#444;border-bottom:1px solid #eee;vertical-align:top;">${key}</td><td style="padding:8px 12px;color:#111;border-bottom:1px solid #eee;">${String(value).replace(/\n/g, "<br/>")}</td></tr>`
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#111;border-bottom:2px solid #C9A86A;padding-bottom:12px;">${subject}</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">${rows}</table>
        <p style="color:#888;font-size:12px;margin-top:24px;">Envoyé depuis betojewelry.com</p>
      </div>
    `;

    const replyTo = fields.email || fields.Email || undefined;

    const { error } = await resend.emails.send({
      from: "Beto Jewelry <noreply@betojewelry.com>",
      to: TO_EMAIL,
      replyTo,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    // Best-effort CRM sync: never fail or slow down the lead's email because
    // Supabase isn't configured yet or is briefly unreachable.
    try {
      const contact = extractContact(fields);
      const client = await upsertClient({ ...contact, source: `site-${formType}` });
      await recordSubmission({
        clientId: client?.id ?? null,
        formType,
        fields,
      });
    } catch (crmError) {
      console.error("CRM sync error:", crmError);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Send email error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
