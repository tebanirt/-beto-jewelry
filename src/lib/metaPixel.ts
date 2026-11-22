declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fires a Meta Pixel "Lead" event once a form has actually been submitted
 * successfully (not on click) — call this right after the API confirms
 * success, so ad delivery optimizes toward real leads, not just clicks.
 */
export function trackMetaLead(formType: string) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "Lead", { content_name: formType });
  }
  // Même événement dans Google Analytics, si le visiteur a accepté la mesure.
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "generate_lead", { form_type: formType });
  }
}

/**
 * Fires a Meta Pixel "Purchase" event when a design deposit has really been
 * paid (Stripe sends the visitor back with its Checkout session id). The
 * session id is the eventID, so Meta counts one purchase per payment even if
 * the page is reloaded; a sessionStorage flag also stops a second send from
 * the same tab. The pixel only exists after the visitor accepted measurement
 * (Loi 25) and loads a moment after the page, so we wait for it a few seconds
 * instead of losing the event.
 */
export function trackMetaPurchase(value: number, currency: string, eventId: string) {
  if (typeof window === "undefined") return;
  const key = `bj_purchase_${eventId}`;
  try {
    if (window.sessionStorage.getItem(key)) return;
  } catch {
    // storage blocked: Meta still dedupes on eventID
  }
  let tries = 0;
  const send = () => {
    if (typeof window.fbq !== "function") {
      tries += 1;
      if (tries < 20) window.setTimeout(send, 250);
      return;
    }
    window.fbq("track", "Purchase", { value, currency, content_name: "design_deposit" }, { eventID: eventId });
    if (typeof window.gtag === "function") {
      window.gtag("event", "purchase", { transaction_id: eventId, value, currency, items: [{ item_name: "design_deposit" }] });
    }
    try {
      window.sessionStorage.setItem(key, "1");
    } catch {
      // ignore
    }
  };
  send();
}

/**
 * Fires a Meta Pixel "Schedule" event once a Calendly booking is actually
 * confirmed — call this from the `calendly.event_scheduled` postMessage
 * event, not on widget load or tab click, so ad delivery optimizes toward
 * real booked calls, not just views of the widget.
 */
export function trackMetaSchedule(contentName: string) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "Schedule", { content_name: contentName });
  }
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "book_consultation", { content_name: contentName });
  }
}
