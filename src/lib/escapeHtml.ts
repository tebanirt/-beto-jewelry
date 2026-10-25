const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escapes a user-supplied value before interpolating it into an HTML email. */
export function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}
