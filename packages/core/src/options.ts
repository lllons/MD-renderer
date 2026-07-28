/** A single entry in a rendered document's table of contents. */
export interface TocEntry {
  /** Rendered heading level (1–6, after any base-level clamping). */
  level: number;
  /** Plain-text heading content. */
  text: string;
  /** Slug used as the heading's `id` and anchor target. */
  id: string;
}

/** Result of {@link render}. */
export interface RenderResult {
  /** Sanitized HTML, safe to insert into the DOM. */
  html: string;
  /** Table of contents collected from the document's headings. */
  toc: TocEntry[];
}

/**
 * Highlighter signature. Return escaped HTML in `value`, or `null` to fall
 * back to plain (escaped) text. Lets consumers swap highlight.js for Shiki, etc.
 */
export type HighlightFn = (
  code: string,
  lang: string | null,
) => { value: string } | null;

export interface RenderOptions {
  /** Enable GFM extras: tables, strikethrough, task lists, autolinking. Default `true`. */
  gfm?: boolean;
  /**
   * Shift every heading down so the document's top heading sits under the app's
   * own chrome. `2` turns a leading `#` into `<h2>`. Clamped at `<h6>`. Default `1` (no shift).
   */
  headingBaseLevel?: number;
  /** Add hover anchor links to headings. Default `true`. */
  anchors?: boolean;
  /** Show a line-number gutter on code blocks. Default `true`. */
  lineNumbers?: boolean;
  /**
   * Syntax highlighter. `"hljs"` uses the bundled highlight.js, `false` disables
   * highlighting, or pass a custom {@link HighlightFn}. Default `"hljs"`.
   */
  highlight?: "hljs" | false | HighlightFn;
  /** Run output through DOMPurify. Default `true`. Only disable for trusted input. */
  sanitize?: boolean;
  /**
   * DOM `window` for sanitization in non-browser environments (e.g. jsdom for
   * SSR). Ignored in the browser, where the global `window` is used.
   */
  window?: unknown;
}

export interface ResolvedOptions {
  gfm: boolean;
  headingBaseLevel: number;
  anchors: boolean;
  lineNumbers: boolean;
  highlight: "hljs" | false | HighlightFn;
  sanitize: boolean;
  window: unknown;
}

export function resolveOptions(options: RenderOptions = {}): ResolvedOptions {
  return {
    gfm: options.gfm ?? true,
    headingBaseLevel: Math.min(6, Math.max(1, options.headingBaseLevel ?? 1)),
    anchors: options.anchors ?? true,
    lineNumbers: options.lineNumbers ?? true,
    highlight: options.highlight ?? "hljs",
    sanitize: options.sanitize ?? true,
    window: options.window,
  };
}
