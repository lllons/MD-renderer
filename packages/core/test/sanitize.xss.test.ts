import { describe, it, expect } from "vitest";
import { render } from "../src/index.js";
import { XSS_PAYLOADS } from "./fixtures/xss.js";

const DANGEROUS_ELEMENTS = "script, iframe, object, embed, base";
const URL_ATTRS = ["href", "src", "action", "formaction", "data"];

/**
 * Structurally verify that rendered HTML cannot execute script: no dangerous
 * elements, no `on*` handlers, no script-scheme (or data:text/html) URLs.
 */
function assertNeutralized(html: string, context: string): void {
  const div = document.createElement("div");
  div.innerHTML = html;

  expect(div.querySelector(DANGEROUS_ELEMENTS), context).toBeNull();

  for (const el of div.querySelectorAll("*")) {
    for (const name of el.getAttributeNames()) {
      expect(name.startsWith("on"), `${context}: ${el.tagName}[${name}]`).toBe(
        false,
      );
    }
    for (const attr of URL_ATTRS) {
      const value = el.getAttribute(attr);
      if (value == null) continue;
      // Strip control chars/whitespace the way a URL parser would before matching schemes.
      const norm = value.replace(/[\u0000-\u0020]+/g, "").toLowerCase();
      expect(
        /^(javascript|vbscript):/.test(norm),
        `${context}: ${el.tagName}[${attr}]=${value}`,
      ).toBe(false);
      expect(norm.startsWith("data:text/html"), context).toBe(false);
    }
  }
}

describe("XSS corpus neutralization", () => {
  for (const payload of XSS_PAYLOADS) {
    it(`neutralizes: ${payload.slice(0, 48)}`, () => {
      assertNeutralized(render(payload).html, `payload=${payload}`);
    });
  }

  it("neutralizes payloads embedded inside otherwise-valid Markdown", () => {
    const doc = [
      "# Heading",
      "",
      "Some text with <img src=x onerror=alert(1)> inline.",
      "",
      "```js",
      "const x = 1; // <script>alert(1)</script> literal code",
      "```",
      "",
      '<a href="javascript:alert(1)">bad link</a>',
    ].join("\n");

    const { html } = render(doc);
    assertNeutralized(html, "embedded");
    // The code sample's literal text is escaped and preserved, not executed.
    expect(html).toContain("&lt;script&gt;");
  });

  it("preserves safe HTML while stripping dangerous parts", () => {
    const { html } = render(
      `<b>bold</b> <i>italic</i> <img src=x onerror=alert(1)>`,
    );
    expect(html).toContain("<b>bold</b>");
    expect(html).toContain("<i>italic</i>");
    assertNeutralized(html, "mixed");
  });
});
