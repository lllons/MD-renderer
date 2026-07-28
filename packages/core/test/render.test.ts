import { describe, it, expect } from "vitest";
import { render } from "../src/index.js";

describe("core Markdown rendering", () => {
  it("renders emphasis", () => {
    expect(render("**bold**").html).toContain("<strong>bold</strong>");
    expect(render("*italic*").html).toContain("<em>italic</em>");
    expect(render("***both***").html).toMatch(/<em><strong>both<\/strong><\/em>/);
    expect(render("~~gone~~").html).toContain("<s>gone</s>");
  });

  it("renders inline code and paragraphs", () => {
    const { html } = render("a `code` b\n\nsecond para");
    expect(html).toContain("<code>code</code>");
    expect(html.match(/<p>/g)?.length).toBe(2);
  });

  it("renders lists and blockquotes", () => {
    expect(render("- a\n- b").html).toMatch(/<ul>[\s\S]*<li>a<\/li>/);
    expect(render("1. a\n2. b").html).toContain("<ol>");
    expect(render("> quote").html).toContain("<blockquote>");
    expect(render("---").html).toContain("<hr>");
  });

  it("renders GFM tables", () => {
    const { html } = render("| a | b |\n|---|---|\n| 1 | 2 |");
    expect(html).toContain("<table>");
    expect(html).toContain("<th>a</th>");
    expect(html).toContain("<td>1</td>");
  });

  it("renders task lists with checkboxes", () => {
    const { html } = render("- [ ] todo\n- [x] done");
    expect(html).toContain("md-task-list");
    expect((html.match(/type="checkbox"/g) ?? []).length).toBe(2);
    expect((html.match(/checked/g) ?? []).length).toBe(1);
    expect(html).toContain("done");
  });

  it("autolinks bare URLs (GFM)", () => {
    const { html } = render("visit https://example.com now");
    expect(html).toContain('href="https://example.com"');
  });

  it("opens external links safely but leaves internal links alone", () => {
    const ext = render("[x](https://example.com)").html;
    expect(ext).toContain('target="_blank"');
    expect(ext).toContain('rel="noopener noreferrer"');

    const internal = render("[x](#section)").html;
    expect(internal).not.toContain('target="_blank"');
  });

  it("renders raw inline HTML when safe", () => {
    expect(render("text <b>bold</b> more").html).toContain("<b>bold</b>");
  });
});
