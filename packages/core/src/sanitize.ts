import DOMPurify from "dompurify";
import type { DOMPurify as DOMPurifyInstance } from "dompurify";

let cached: { win: unknown; instance: DOMPurifyInstance } | null = null;

function getPurifier(win: unknown): DOMPurifyInstance {
  const target =
    win ?? (typeof window !== "undefined" ? (window as unknown) : undefined);
  if (!target) {
    throw new Error(
      "@md-renderer/core: no DOM `window` available for sanitization. " +
        "Pass `options.window` (e.g. a jsdom window) in non-browser environments, " +
        "or set `sanitize: false` for trusted input.",
    );
  }
  if (cached && cached.win === target) return cached.instance;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instance = DOMPurify(target as any);
  // Force external links to open safely. Duck-typed (no global `Element`) so
  // this works under SSR/jsdom where a passed-in window's nodes belong to a
  // different realm than any global DOM.
  instance.addHook("afterSanitizeAttributes", (node) => {
    const el = node as unknown as {
      tagName?: string;
      getAttribute?: (n: string) => string | null;
      setAttribute?: (n: string, v: string) => void;
    };
    if (el.tagName === "A" && el.getAttribute?.("target") === "_blank") {
      el.setAttribute?.("rel", "noopener noreferrer");
    }
  });
  cached = { win: target, instance };
  return instance;
}

/**
 * Sanitize rendered HTML against XSS. Keeps the classes, ids, `data-*`,
 * `aria-*`, and safe `target` attributes the renderer produces; strips
 * `<script>`, event-handler attributes, and `javascript:` URLs.
 */
export function sanitize(html: string, win?: unknown): string {
  return getPurifier(win).sanitize(html, {
    ADD_ATTR: ["target"],
    // Keep the whole document fragment (headings, code chrome, tables, etc.).
    USE_PROFILES: { html: true },
  }) as string;
}
