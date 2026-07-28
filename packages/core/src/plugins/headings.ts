import type MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";
import type { ResolvedOptions, TocEntry } from "../options.js";
import { Slugger } from "../util.js";

/**
 * Walk the token stream to: clamp heading levels under `headingBaseLevel`,
 * assign de-duplicated slug ids, and collect the table of contents. Mutates
 * `heading_open`/`heading_close` tokens in place and returns the TOC.
 *
 * Anchor markup is emitted by {@link installHeadingRenderRules}, which reads the
 * id stored on the token here.
 */
export function transformHeadings(
  tokens: Token[],
  opts: ResolvedOptions,
): TocEntry[] {
  const toc: TocEntry[] = [];
  const slugger = new Slugger();
  const shift = opts.headingBaseLevel - 1;

  for (let i = 0; i < tokens.length; i++) {
    const open = tokens[i];
    if (open.type !== "heading_open") continue;

    const original = Number(open.tag.slice(1)); // "h3" → 3
    const level = Math.min(6, original + shift);
    const tag = `h${level}`;

    const inline = tokens[i + 1];
    const text = inline?.type === "inline" ? inline.content : "";
    const id = slugger.slug(text);

    open.tag = tag;
    open.attrSet("id", id);

    const close = tokens[i + 2];
    if (close?.type === "heading_close") {
      close.tag = tag;
      close.meta = { ...(close.meta as object), id, anchor: opts.anchors };
    }

    toc.push({ level, text, id });
  }

  return toc;
}

/** Install the `heading_close` render rule that appends the hover anchor link. */
export function installHeadingRenderRules(md: MarkdownIt): void {
  md.renderer.rules.heading_close = (tokens, idx, mdOptions, _env, self) => {
    const token = tokens[idx];
    const meta = token.meta as { id?: string; anchor?: boolean } | undefined;
    const anchor =
      meta?.anchor && meta.id
        ? `<a class="md-anchor" href="#${meta.id}" aria-hidden="true" tabindex="-1">#</a>`
        : "";
    return anchor + self.renderToken(tokens, idx, mdOptions);
  };
}
