import { NextResponse } from "next/server";
import { Resend } from "resend";
import { recordSubmission, upsertClient } from "@/lib/supabase";
import { escapeHtml } from "@/lib/escapeHtml";
import { formatAttribution, parseAttribution } from "@/lib/attribution";
import {
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_BYTES,
  MAX_INSPIRATION_IMAGES,
} from "@/lib/imageAttachments";

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
  "custom-design": "Nouvelle demande — Design sur mesure",
  consultation: "Nouvelle demande — Consultation",
  quote: "Nouvelle demande — Devis",
};

const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

/**
 * Inspiration images from the custom-design form. Re-validated here, never
 * trusted from the browser: count, type, base64 shape and decoded size. An
 * invalid image is dropped, never the whole lead.
 */
function parseAttachments(raw: unknown) {
  if (!Array.isArray(raw)) return { attachments: [], dropped: 0 };
  const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
  let dropped = 0;
  for (const item of raw.slice(0, MAX_INSPIRATION_IMAGES)) {
    const a = item as { filename?: unknown; contentType?: unknown; content?: unknown };
    const contentType = typeof a.contentType === "string" ? a.contentType.toLowerCase() : "";
    const content = typeof a.content === "string" ? a.content : "";
    if (
      !(ALLOWED_ATTACHMENT_TYPES as readonly string[]).includes(contentType) ||
      !content ||
      content.length > Math.ceil((MAX_ATTACHMENT_BYTES * 4) / 3) + 4 ||
      !BASE64_RE.test(content)
    ) {
      dropped++;
      continue;
    }
    const buffer = Buffer.from(content, "base64");
    if (buffer.length === 0 || buffer.length > MAX_ATTACHMENT_BYTES) {
      dropped++;
      continue;
    }
    const ext = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
    const stem =
      typeof a.filename === "string"
        ? a.filename.replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "-").slice(0, 60)
        : "";
    attachments.push({
      filename: `inspiration-${attachments.length + 1}${stem ? `-${stem}` : ""}.${ext}`,
      content: buffer,
      contentType,
    });
  }
  dropped += Math.max(0, raw.length - MAX_INSPIRATION_IMAGES);
  return { attachments, dropped };
}

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await request.json();
    const { formType, fields: rawFields, priority } = body as {
      formType: string;
      fields: Record<string, string>;
      priority?: unknown;
    };
    const { attachments, dropped } = parseAttachments((body as { attachments?: unknown }).attachments);

    if (!formType || !rawFields) {
      return NextResponse.json({ error: "Missing formType or fields" }, { status: 400 });
    }

    // Which ad or site brought the lead (see src/lib/attribution.ts): shown in
    // the email, kept with the submission, and stored on the CRM client.
    const attributionParsed = parseAttribution((body as { attribution?: unknown }).attribution);
    const attribution = attributionParsed ? formatAttribution(attributionParsed) : undefined;
    const fields: Record<string, string> = attribution ? { ...rawFields, Provenance: attribution } : rawFields;

    const baseSubject = FORM_LABELS[formType] || `Nouvelle demande — ${escapeHtml(formType)}`;
    // The visitor was promised an answer (price within the hour, or quote
    // within 24 h): make that impossible to miss in Rayane's inbox.
    const subject =
      priority === "1h"
        ? `${baseSubject} · PRIX PROMIS EN MOINS D'1 H`
        : priority === "24h"
          ? `${baseSubject} · SOUMISSION PROMISE EN 24 H`
          : baseSubject;

    const rows = Object.entries(fields)
      .filter(([, value]) => value && value.toString().trim().length > 0)
      .map(
        ([key, value]) =>
          `<tr><td style="padding:8px 12px;font-weight:600;color:#444;border-bottom:1px solid #eee;vertical-align:top;">${escapeHtml(key)}</td><td style="padding:8px 12px;color:#111;border-bottom:1px solid #eee;">${escapeHtml(value).replace(/\n/g, "<br/>")}</td></tr>`
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#111;border-bottom:2px solid #C9A86A;padding-bottom:12px;">${escapeHtml(subject)}</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">${rows}</table>
        ${attachments.length > 0 ? `<p style="color:#111;font-size:14px;margin-top:16px;">${attachments.length} image(s) d'inspiration en pièce jointe.</p>` : ""}
        ${dropped > 0 ? `<p style="color:#b45309;font-size:13px;margin-top:8px;">${dropped} image(s) refusée(s) (format ou taille invalide) : demander au client de la renvoyer.</p>` : ""}
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
      ...(attachments.length > 0 ? { attachments } : {}),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    // Best-effort CRM sync: never fail or slow down the lead's email because
    // Supabase isn't configured yet or is briefly unreachable.
    // The CRM id lets the deposit payment (Stripe client_reference_id) land on
    // the right client automatically.
    let ref: string | undefined;
    try {
      const contact = extractContact(fields);
      const client = await upsertClient({ ...contact, source: `site-${formType}`, attribution });
      ref = client?.id;
      await recordSubmission({
        clientId: client?.id ?? null,
        formType,
        fields,
      });
    } catch (crmError) {
      console.error("CRM sync error:", crmError);
    }

    return NextResponse.json({ success: true, ...(ref ? { ref } : {}) });
  } catch (err) {
    console.error("Send email error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
