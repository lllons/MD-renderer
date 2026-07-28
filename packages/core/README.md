# @md-renderer/core

Framework-agnostic Markdown → **sanitized** HTML engine for AI output. The
rendering foundation of MD-renderer (see the [project plan](../../docs/PROJECT_PLAN.md)).

## Install

```bash
pnpm add @md-renderer/core
```

## Usage

```ts
import { render, hydrate } from "@md-renderer/core";
import "@md-renderer/core/styles.css";

const { html, toc } = render("# Hello\n\n```ts\nconst x = 1;\n```");

const view = document.querySelector(".md-body")!;
view.innerHTML = html;   // already sanitized
hydrate(view);           // wire copy-code buttons
```

Wrap output in an element with the `md-body` class so the stylesheet applies.

## What it does (Phase 1)

- **GFM Markdown:** headings, emphasis, strikethrough, lists, task lists,
  blockquotes, tables, links, autolinks, inline/raw HTML.
- **Headings:** slug ids, hover anchors, TOC extraction, level clamping.
- **Code blocks:** highlight.js highlighting, language label, filename title,
  copy button, line numbers, line highlighting (`{1,3-5}`), `diff` tinting.
- **Security:** all output sanitized with DOMPurify; external links get
  `target="_blank" rel="noopener noreferrer"`.

## API

### `render(markdown, options?) → { html, toc }`

| Option | Default | Description |
|--------|---------|-------------|
| `gfm` | `true` | Tables, strikethrough, task lists, autolinking |
| `headingBaseLevel` | `1` | Shift headings down (e.g. `2` → leading `#` becomes `<h2>`) |
| `anchors` | `true` | Hover anchor links on headings |
| `lineNumbers` | `true` | Line-number gutter on code blocks |
| `highlight` | `"hljs"` | `"hljs"`, `false`, or a custom `HighlightFn` |
| `sanitize` | `true` | Run output through DOMPurify |
| `window` | — | DOM window for sanitizing in Node/SSR (e.g. jsdom) |

### `hydrate(root) → cleanup`

Wires interactive behavior (copy buttons) on rendered output. Browser only.

## Non-browser / SSR

Sanitization needs a DOM. In Node, pass a jsdom window:

```ts
import { JSDOM } from "jsdom";
render(md, { window: new JSDOM("").window });
```

## Develop

```bash
pnpm test        # vitest (jsdom), includes an XSS corpus
pnpm typecheck
pnpm build       # tsc → dist/
```
