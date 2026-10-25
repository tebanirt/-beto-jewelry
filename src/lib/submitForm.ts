/**
 * Posts a lead form to /api/send-email, retrying once after a transient
 * failure (e.g. a serverless cold-start timeout) before reporting a real
 * failure — a real lead's submission shouldn't bounce back as an error
 * just because the first attempt was slow or dropped.
 */
export async function submitLeadForm(
  formType: string,
  fields: Record<string, string>
): Promise<boolean> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType, fields }),
      });
      if (res.ok) return true;
    } catch {
      // network error — fall through to retry
    }
    if (attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
  return false;
}
