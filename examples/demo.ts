/**
 * Render examples/sample.md to a standalone HTML page you can open in a browser.
 * Run with: `pnpm demo`  → writes examples/out/demo.html
 *
 * Uses a jsdom window so sanitization runs exactly as it would in the browser.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { JSDOM } from "jsdom";
import { render } from "../packages/core/src/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const md = readFileSync(join(here, "sample.md"), "utf8");
const css = readFileSync(
  join(here, "../packages/core/src/styles/md-renderer.css"),
  "utf8",
);

const { html, toc } = render(md, {
  window: new JSDOM("").window,
  headingBaseLevel: 1,
});

const toc_html = toc
  .map((t) => `<li style="margin-left:${(t.level - 1) * 1.2}em"><a href="#${t.id}">${t.text}</a></li>`)
  .join("\n");

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>MD-renderer — Phase 1 demo</title>
<style>
  body { margin: 0; background: Canvas; }
  .wrap { max-width: 820px; margin: 0 auto; padding: 2rem 1.25rem 6rem; }
  .toc { font-size: .9rem; border: 1px solid var(--md-border); border-radius: 8px; padding: .5rem 1rem; margin-bottom: 2rem; }
  .toc ul { list-style: none; padding-left: 0; margin: .25rem 0; }
  .toc a { text-decoration: none; }
${css}
</style>
</head>
<body>
  <div class="wrap md-body">
    <nav class="toc"><strong>Contents</strong><ul>${toc_html}</ul></nav>
    ${html}
  </div>
</body>
</html>
`;

const outDir = join(here, "out");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, "demo.html");
writeFileSync(outFile, page, "utf8");
console.log(`Wrote ${outFile} (${toc.length} headings, ${page.length} bytes)`);
