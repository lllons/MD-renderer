import type { HighlightFn } from "../options.js";
import { escapeHtml } from "../util.js";

interface FenceInfo {
  lang: string | null;
  title: string | null;
  /** 1-based line numbers to highlight, e.g. from ` {1,3-5} `. */
  highlightLines: Set<number>;
}

/** Parse a fence info string: `lang title="file.ts" {1,3-5}` (order-independent). */
export function parseFenceInfo(raw: string): FenceInfo {
  const info = raw.trim();
  const title = /title="([^"]*)"/.exec(info)?.[1] ?? null;

  const highlightLines = new Set<number>();
  const ranges = /\{([\d,\s-]+)\}/.exec(info)?.[1];
  if (ranges) {
    for (const part of ranges.split(",")) {
      const seg = part.trim();
      if (!seg) continue;
      const m = /^(\d+)\s*-\s*(\d+)$/.exec(seg);
      if (m) {
        const [a, b] = [Number(m[1]), Number(m[2])];
        for (let n = Math.min(a, b); n <= Math.max(a, b); n++)
          highlightLines.add(n);
      } else if (/^\d+$/.test(seg)) {
        highlightLines.add(Number(seg));
      }
    }
  }

  // Language is the first token, unless that token is itself metadata.
  const first = info.split(/\s+/)[0] ?? "";
  const lang = first && !first.includes("=") && !first.startsWith("{") ? first : null;

  return { lang, title, highlightLines };
}

/**
 * Split highlight.js output into one HTML string per source line, preserving
 * spans that straddle a newline by closing them at the break and reopening them
 * on the next line. Relies on hljs emitting only `<span>` tags and entity-escaped text.
 */
export function splitHighlightedLines(html: string): string[] {
  const lines: string[] = [];
  const openStack: string[] = [];
  let cur = "";

  const tokens = html.match(/<[^>]+>|[^<]+/g) ?? [];
  for (const tk of tokens) {
    if (tk.startsWith("</")) {
      cur += tk;
      openStack.pop();
    } else if (tk.startsWith("<")) {
      cur += tk;
      openStack.push(tk);
    } else {
      const parts = tk.split("\n");
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
          for (let s = 0; s < openStack.length; s++) cur += "</span>";
          lines.push(cur);
          cur = openStack.join("");
        }
        cur += parts[i];
      }
    }
  }
  lines.push(cur);
  return lines;
}

interface LineCell {
  html: string;
  extraClass: string;
}

/** Render a diff fence: per-line escape with +/-/@@ tinting classes (no token highlighting). */
function renderDiffLines(code: string): LineCell[] {
  return code.split("\n").map((line) => {
    const c = line[0];
    const extraClass =
      c === "+"
        ? "md-line--add"
        : c === "-"
          ? "md-line--del"
          : line.startsWith("@@")
            ? "md-line--meta"
            : "";
    return { html: escapeHtml(line), extraClass };
  });
}

export interface CodeRenderOptions {
  highlighter: HighlightFn;
  lineNumbers: boolean;
}

/** Build the HTML for one fenced code block, including chrome. */
export function renderCodeBlock(
  code: string,
  infoRaw: string,
  opts: CodeRenderOptions,
): string {
  const { lang, title, highlightLines } = parseFenceInfo(infoRaw);
  const isDiff = lang === "diff";

  let cells: LineCell[];
  if (isDiff) {
    cells = renderDiffLines(code);
  } else {
    const result = opts.highlighter(code, lang) ?? { value: escapeHtml(code) };
    cells = splitHighlightedLines(result.value).map((html) => ({
      html,
      extraClass: "",
    }));
  }

  const lineHtml = cells
    .map((cell, i) => {
      const classes = ["md-line"];
      if (cell.extraClass) classes.push(cell.extraClass);
      if (highlightLines.has(i + 1)) classes.push("md-line--hl");
      // Zero-width space keeps empty lines from collapsing without polluting copied text.
      return `<span class="${classes.join(" ")}">${cell.html || "&#8203;"}</span>`;
    })
    .join("\n");

  const displayLang = lang ?? "text";
  const blockClasses = ["md-code-block"];
  if (opts.lineNumbers) blockClasses.push("md-code-block--numbered");
  if (isDiff) blockClasses.push("md-code-block--diff");

  const header =
    `<div class="md-code-header">` +
    (title ? `<span class="md-code-title">${escapeHtml(title)}</span>` : "") +
    `<span class="md-code-lang">${escapeHtml(displayLang)}</span>` +
    `<button class="md-code-copy" type="button" aria-label="Copy code">Copy</button>` +
    `</div>`;

  return (
    `<div class="${blockClasses.join(" ")}" data-lang="${escapeHtml(displayLang)}">` +
    header +
    `<pre class="md-code-pre"><code class="hljs language-${escapeHtml(lang ?? "text")}">` +
    lineHtml +
    `</code></pre>` +
    `</div>`
  );
}
