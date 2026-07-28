import type Token from "markdown-it/lib/token.mjs";

/**
 * Minimal GFM task-list support: turn list items whose text starts with
 * `[ ]` / `[x]` into disabled checkboxes. Operates on the token stream so it
 * composes with the rest of the pipeline; no extra dependency required.
 */
export function transformTaskLists(
  tokens: Token[],
  TokenClass: new (type: string, tag: string, nesting: -1 | 0 | 1) => Token,
): void {
  for (let i = 0; i < tokens.length; i++) {
    const inline = tokens[i];
    if (inline.type !== "inline") continue;
    // A task item looks like: list_item_open, paragraph_open, inline(this).
    const isItemStart =
      tokens[i - 1]?.type === "paragraph_open" &&
      tokens[i - 2]?.type === "list_item_open";
    if (!isItemStart) continue;

    const firstChild = inline.children?.[0];
    if (!firstChild || firstChild.type !== "text") continue;
    const match = /^\[([ xX])\]\s+/.exec(firstChild.content);
    if (!match) continue;

    const checked = match[1] !== " ";
    firstChild.content = firstChild.content.slice(match[0].length);

    const box = new TokenClass("html_inline", "", 0);
    box.content = `<input class="md-task" type="checkbox" disabled${checked ? " checked" : ""}> `;
    inline.children!.unshift(box);

    tokens[i - 2].attrJoin("class", "md-task-item");
    // Mark the enclosing list (the list_item_open sits inside a *_list_open).
    for (let j = i - 3; j >= 0; j--) {
      const t = tokens[j];
      if (t.type === "bullet_list_open" || t.type === "ordered_list_open") {
        t.attrJoin("class", "md-task-list");
        break;
      }
      if (t.type === "bullet_list_close" || t.type === "ordered_list_close") break;
    }
  }
}
