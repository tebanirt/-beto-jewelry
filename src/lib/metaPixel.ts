declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
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
}
