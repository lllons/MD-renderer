/** Escape text for safe inclusion in HTML element content or double-quoted attributes. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * GitHub-style slugger with per-document de-duplication. Lower-cases, drops
 * punctuation, collapses whitespace to hyphens, and appends `-1`, `-2`, … to
 * repeats.
 */
export class Slugger {
  private seen = new Map<string, number>();

  slug(text: string): string {
    const base =
      text
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "section";

    const count = this.seen.get(base) ?? 0;
    this.seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  }
}
