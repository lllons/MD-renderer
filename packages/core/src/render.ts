import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token.mjs";
import {
  resolveOptions,
  type RenderOptions,
  type RenderResult,
} from "./options.js";
import { resolveHighlighter } from "./highlight.js";
import { renderCodeBlock } from "./plugins/code.js";
import {
  transformHeadings,
  installHeadingRenderRules,
} from "./plugins/headings.js";
import { transformTaskLists } from "./plugins/tasklists.js";
import { sanitize } from "./sanitize.js";

/**
 * Render a Markdown string to sanitized HTML plus a table of contents.
 *
 * The pipeline is: parse → transform tokens (headings, task lists) → render
 * (custom fence + link rules) → sanitize (DOMPurify).
 */
export function render(src: string, options?: RenderOptions): RenderResult {
  const opts = resolveOptions(options);
  const highlighter = resolveHighlighter(opts.highlight);

  const md = new MarkdownIt({
    html: true, // raw HTML allowed here, made safe by the sanitize step
    linkify: opts.gfm,
    breaks: false,
    typographer: false,
  });

  // Code fences → chrome + highlighting.
  md.renderer.rules.fence = (tokens, idx) =>
    renderCodeBlock(tokens[idx].content.replace(/\n$/, ""), tokens[idx].info, {
      highlighter,
      lineNumbers: opts.lineNumbers,
    });

  // External links open safely.
  const defaultLinkOpen =
    md.renderer.rules.link_open ??
    ((tokens, idx, o, _e, self) => self.renderToken(tokens, idx, o));
  md.renderer.rules.link_open = (tokens, idx, o, env, self) => {
    const href = tokens[idx].attrGet("href") ?? "";
    if (/^https?:\/\//i.test(href)) {
      tokens[idx].attrSet("target", "_blank");
      tokens[idx].attrSet("rel", "noopener noreferrer");
    }
    return defaultLinkOpen(tokens, idx, o, env, self);
  };

  installHeadingRenderRules(md);

  const env = {};
  const tokens = md.parse(src, env);
  const toc = transformHeadings(tokens, opts);
  transformTaskLists(tokens, Token);

  let html = md.renderer.render(tokens, md.options, env);
  if (opts.sanitize) html = sanitize(html, opts.window);

  return { html, toc };
}
