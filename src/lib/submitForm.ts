import type { LeadAttachment } from "@/lib/imageAttachments";
import { getAttribution } from "@/lib/attribution";

export type LeadFormOptions = {
  /** Inspiration images, attached to the email sent to Rayane. */
  attachments?: LeadAttachment[];
  /** Answer promised to the visitor (price within 1 h, or quote within 24 h): flagged in the email subject. */
  priority?: "1h" | "24h";
  /** Receives the CRM client id when the server returns one (used for the deposit payment link). */
  onRef?: (ref: string) => void;
};

/**
 * Posts a lead form to /api/send-email, retrying once after a transient
 * failure (e.g. a serverless cold-start timeout) before reporting a real
 * failure — a real lead's submission shouldn't bounce back as an error
 * just because the first attempt was slow or dropped.
 */
export async function submitLeadForm(
  formType: string,
  fields: Record<string, string>,
  options: LeadFormOptions = {}
): Promise<boolean> {
  const attribution = getAttribution();
  const body = JSON.stringify({
    formType,
    fields,
    ...(attribution ? { attribution } : {}),
    ...(options.attachments?.length ? { attachments: options.attachments } : {}),
    ...(options.priority ? { priority: options.priority } : {}),
  });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (res.ok) {
        if (options.onRef) {
          const data = (await res.json().catch(() => null)) as { ref?: unknown } | null;
          if (typeof data?.ref === "string") options.onRef(data.ref);
        }
        return true;
      }
    } catch {
      // network error — fall through to retry
    }
    if (attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
  return false;
}
