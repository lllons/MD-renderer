import { describe, it, expect } from "vitest";
import { render } from "../src/index.js";
import {
  parseFenceInfo,
  splitHighlightedLines,
} from "../src/plugins/code.js";

describe("code block chrome & highlighting", () => {
  it("wraps code in chrome with lang label and copy button", () => {
    const { html } = render("```ts\nconst x = 1;\n```");
    expect(html).toContain("md-code-block");
    expect(html).toContain("md-code-copy");
    expect(html).toContain('class="hljs language-ts"');
    expect(html).toContain(">ts<"); // lang label
  });

  it("highlights known languages with hljs token spans", () => {
    const { html } = render("```js\nconst x = 1;\n```");
    expect(html).toContain("hljs-keyword"); // `const`
  });

  it("shows a filename title from the info string", () => {
    const { html } = render('```ts title="server.ts"\nok\n```');
    expect(html).toContain('class="md-code-title">server.ts');
  });

  it("enables line numbers by default and can turn them off", () => {
    expect(render("```\na\n```").html).toContain("md-code-block--numbered");
    expect(render("```\na\n```", { lineNumbers: false }).html).not.toContain(
      "md-code-block--numbered",
    );
  });

  it("highlights selected lines from a range spec", () => {
    const { html } = render("```ts {2}\nline1\nline2\nline3\n```");
    const lines = html.match(/<span class="md-line[^"]*"/g) ?? [];
    expect(lines[0]).not.toContain("md-line--hl");
    expect(lines[1]).toContain("md-line--hl");
    expect(lines[2]).not.toContain("md-line--hl");
  });

  it("tints diff blocks", () => {
    const { html } = render("```diff\n+added\n-removed\n context\n```");
    expect(html).toContain("md-code-block--diff");
    expect(html).toContain("md-line--add");
    expect(html).toContain("md-line--del");
  });

  it("escapes code content instead of executing it", () => {
    const { html } = render("```html\n<script>alert(1)</script>\n```");
    // hljs may split the escaped tag across highlight spans, so assert the
    // security property (angle brackets escaped, no live <script>) rather than
    // a contiguous substring.
    expect(html).toContain("&lt;");
    expect(html).toContain("&gt;");
    expect(html).not.toMatch(/<script/i);
  });
});

describe("parseFenceInfo", () => {
  it("extracts language, title, and highlight ranges", () => {
    const info = parseFenceInfo('ts title="a.ts" {1,3-5}');
    expect(info.lang).toBe("ts");
    expect(info.title).toBe("a.ts");
    expect([...info.highlightLines].sort((a, b) => a - b)).toEqual([1, 3, 4, 5]);
  });

  it("treats a bare fence as having no language", () => {
    expect(parseFenceInfo("").lang).toBeNull();
  });
});

describe("splitHighlightedLines", () => {
  it("reopens spans that straddle a newline", () => {
    const out = splitHighlightedLines('<span class="s">a\nb</span>c');
    expect(out).toEqual([
      '<span class="s">a</span>',
      '<span class="s">b</span>c',
    ]);
  });

  it("returns one entry per line for plain text", () => {
    expect(splitHighlightedLines("a\nb\nc")).toEqual(["a", "b", "c"]);
  });
});
