import { describe, it, expect } from "vitest";
import { render } from "../src/index.js";

describe("headings, anchors, and TOC", () => {
  it("assigns slug ids and collects a TOC", () => {
    const { html, toc } = render("# Hello World\n\n## Sub Section");
    expect(html).toContain('<h1 id="hello-world"');
    expect(html).toContain('<h2 id="sub-section"');
    expect(toc).toEqual([
      { level: 1, text: "Hello World", id: "hello-world" },
      { level: 2, text: "Sub Section", id: "sub-section" },
    ]);
  });

  it("de-duplicates repeated heading slugs", () => {
    const { toc } = render("# Intro\n\n# Intro\n\n# Intro");
    expect(toc.map((t) => t.id)).toEqual(["intro", "intro-1", "intro-2"]);
  });

  it("clamps heading levels under headingBaseLevel", () => {
    const { html, toc } = render("# Top\n\n## Next", { headingBaseLevel: 2 });
    expect(html).toContain('<h2 id="top"');
    expect(html).toContain('<h3 id="next"');
    expect(toc[0].level).toBe(2);
  });

  it("never emits a heading deeper than h6", () => {
    const { html } = render("###### Deep", { headingBaseLevel: 3 });
    expect(html).toContain("<h6");
    expect(html).not.toContain("<h7");
  });

  it("adds hover anchors by default and omits them when disabled", () => {
    expect(render("# A").html).toContain('class="md-anchor" href="#a"');
    expect(render("# A", { anchors: false }).html).not.toContain("md-anchor");
  });
});
