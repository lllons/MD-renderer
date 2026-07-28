# Feature catalog

The complete list of features MD-renderer will provide — all **100**, grouped by
the ten areas below. Each row notes **how** it's delivered (which package /
technology / plugin) and the **phase** it lands in (see [`ROADMAP.md`](./ROADMAP.md)).

> ⚠️ Planning document. Nothing here is built yet; this is the committed scope.

**Phase legend:** `P1` core renderer · `P2` thinking & streaming · `P3` web
component & animations · `P4` app & Ollama · `P5` system prompt · `P6`
portability · `P7` polish. A `+` means it starts earlier and is refined later.

**Delivery legend:** `core` = `@md-renderer/core` · `wc` = web component (Lit,
Shadow DOM) · `app` = localhost app · `server` = Bun/Node proxy/host.

---

## A. Core Markdown Rendering (1–20)

| # | Feature | Delivered by | Phase |
|---|---------|--------------|-------|
| 1 | ATX headings (`# Heading`) | core · markdown-it | P1 |
| 2 | Setext headings (`Heading` / `===`) | core · markdown-it | P1 |
| 3 | Paragraph rendering | core · markdown-it | P1 |
| 4 | Line break handling (soft/hard) | core · markdown-it | P1 |
| 5 | Bold (`**bold**`) | core | P1 |
| 6 | Italic (`*italic*`) | core | P1 |
| 7 | Bold + italic combinations | core | P1 |
| 8 | Strikethrough (`~~text~~`) | core · GFM | P1 |
| 9 | Inline code (`` `code` ``) | core | P1 |
| 10 | Fenced code blocks (```` ``` ````) | core · code plugin | P1 |
| 11 | Indented code blocks | core | P1 |
| 12 | Blockquotes | core | P1 |
| 13 | Nested blockquotes | core | P1 |
| 14 | Ordered lists | core | P1 |
| 15 | Unordered lists | core | P1 |
| 16 | Nested lists | core | P1 |
| 17 | Task / check lists (`- [ ]`) | core · GFM | P1 |
| 18 | Horizontal rules | core | P1 |
| 19 | Links | core · sanitized | P1 |
| 20 | Automatic URL detection (autolink) | core · linkify | P1 |

## B. Media Support (21–30)

| # | Feature | Delivered by | Phase |
|---|---------|--------------|-------|
| 21 | Image embedding | core | P1 |
| 22 | Image captions (`![alt](src "caption")`) | core · media plugin | P1 |
| 23 | Image resizing (`{width=…}` attrs) | core · media plugin | P3 |
| 24 | Image alignment | core · media plugin | P3 |
| 25 | Image galleries (grouped images) | wc · media plugin | P3 |
| 26 | Lazy-loaded images (`loading="lazy"`) | core | P1 |
| 27 | Responsive images (`srcset`/`max-width`) | core · wc | P3 |
| 28 | Video embedding (`<video>` / providers) | core · sanitized/sandboxed | P3 |
| 29 | Audio embedding (`<audio>`) | core · sanitized | P3 |
| 30 | File attachment previews | wc · app | P4 |

## C. Code Features (31–40)

| # | Feature | Delivered by | Phase |
|---|---------|--------------|-------|
| 31 | Syntax highlighting | core · highlight.js/Shiki | P1 |
| 32 | 100+ languages | core · highlighter grammars | P1 |
| 33 | Custom language / code themes | wc · theme tokens | P3 |
| 34 | Line numbering | core · code plugin | P1 |
| 35 | Highlight selected lines (`{1,3-5}`) | core · code plugin | P1 |
| 36 | Code block titles (`title="file.ts"`) | core · code plugin | P1 |
| 37 | Copy-code button | wc · hydrate hook | P1+ |
| 38 | Code block collapsing | wc · hydrate hook | P3 |
| 39 | Code diff rendering (```` ```diff ````) | core · code plugin | P1 |
| 40 | Terminal / console output styling | core · code plugin | P1 |

## D. Tables & Data (41–50)

| # | Feature | Delivered by | Phase |
|---|---------|--------------|-------|
| 41 | Markdown tables | core · GFM | P1 |
| 42 | Column alignment | core · GFM | P1 |
| 43 | Sortable tables | wc · table plugin (interactive) | P3 |
| 44 | Searchable / filterable tables | wc · table plugin | P3 |
| 45 | CSV-to-table conversion (```` ```csv ````) | core · data plugin | P3 |
| 46 | JSON viewer blocks (```` ```json ````) | core · data plugin (collapsible tree) | P3 |
| 47 | YAML viewer blocks | core · data plugin | P3 |
| 48 | XML viewer blocks | core · data plugin | P3 |
| 49 | Table of contents from tables/data | core · headings/toc plugin | P4 |
| 50 | Data visualization blocks (charts) | wc · chart plugin (lazy) | P6 |

## E. Mathematical Features (51–60)

| # | Feature | Delivered by | Phase |
|---|---------|--------------|-------|
| 51 | Inline LaTeX (`$…$`) | core · KaTeX | P1 |
| 52 | Block LaTeX (`$$…$$`) | core · KaTeX | P1 |
| 53 | Equation numbering | core · math plugin | P3 |
| 54 | Math syntax highlighting (source) | core · code plugin | P1 |
| 55 | Matrix rendering | core · KaTeX | P1 |
| 56 | Chemical equations (mhchem) | core · KaTeX mhchem | P3 |
| 57 | Physics notation (physics pkg) | core · KaTeX | P3 |
| 58 | Graph plotting (function plots) | wc · plot plugin (lazy) | P6 |
| 59 | Unit conversion blocks | wc · compute plugin | P6 |
| 60 | Calculator expressions | wc · compute plugin (sandboxed) | P6 |

## F. Diagrams & Visual Content (61–70)

| # | Feature | Delivered by | Phase |
|---|---------|--------------|-------|
| 61 | Mermaid diagrams (```` ```mermaid ````) | wc · mermaid plugin (lazy) | P2+ |
| 62 | Flowcharts | wc · mermaid | P2+ |
| 63 | Sequence diagrams | wc · mermaid | P2+ |
| 64 | Class diagrams | wc · mermaid | P2+ |
| 65 | State diagrams | wc · mermaid | P2+ |
| 66 | Entity-relationship diagrams | wc · mermaid | P2+ |
| 67 | Timeline diagrams | wc · mermaid | P2+ |
| 68 | Mind maps | wc · mermaid | P6 |
| 69 | ASCII diagram rendering | core · code plugin (monospace) | P1 |
| 70 | Graph visualization (nodes/edges) | wc · graph plugin (lazy) | P6 |

## G. Document Navigation (71–80)

| # | Feature | Delivered by | Phase |
|---|---------|--------------|-------|
| 71 | Automatic table of contents | core · toc plugin | P1+ |
| 72 | Heading anchors | core · headings plugin | P1 |
| 73 | Back-to-top button | wc · app | P3 |
| 74 | Breadcrumb navigation | app | P4 |
| 75 | Page hierarchy | app | P4 |
| 76 | Sidebar navigation | app | P4 |
| 77 | Previous / next document navigation | app | P4 |
| 78 | Document search | app · index | P4 |
| 79 | Search highlighting | wc · app | P4 |
| 80 | Reading progress indicator | wc | P3 |

## H. Advanced Markdown Extensions (81–90)

| # | Feature | Delivered by | Phase |
|---|---------|--------------|-------|
| 81 | YAML frontmatter | core · frontmatter plugin | P1 |
| 82 | TOML frontmatter | core · frontmatter plugin | P1 |
| 83 | Custom metadata fields | core · frontmatter plugin | P1 |
| 84 | Footnotes | core · footnote plugin | P1 |
| 85 | Citations / references | core · cite plugin | P3 |
| 86 | Definition lists | core · deflist plugin | P1 |
| 87 | Admonitions / callouts (`> [!NOTE]`) | core · callout plugin | P1 |
| 88 | Tabs & tab groups | wc · tabs plugin (interactive) | P3 |
| 89 | Collapsible sections (`<details>`) | core · wc | P1 |
| 90 | Spoiler blocks | wc · spoiler plugin | P3 |

## I. Professional Documentation (91–100)

| # | Feature | Delivered by | Phase |
|---|---------|--------------|-------|
| 91 | Versioned documentation support | app | P6 |
| 92 | Multi-language documentation | app · i18n | P7 |
| 93 | API documentation blocks | core · api plugin | P6 |
| 94 | Automatic API reference generation | core/app · OpenAPI ingest | P6 |
| 95 | Changelog rendering | core · changelog plugin | P6 |
| 96 | Release-notes templates | app | P6 |
| 97 | Broken-link detection | core/app · link checker | P7 |
| 98 | Accessibility checking | core/app · a11y linter | P7 |
| 99 | SEO metadata generation | app · from frontmatter | P7 |
| 100 | Export to multiple formats (HTML/PDF/MD) | app · export pipeline | P6 |

---

## Notes on scope & sequencing

- **Static rendering (`core`) first.** Anything that is pure Markdown → HTML
  (categories A, C, E source, most of B and H) lands in **P1** so the renderer
  is useful immediately.
- **Interactive features need the web component.** Sortable/searchable tables,
  tabs, collapsing, galleries, reading progress, and diagram rendering require
  DOM behavior and live in **P3+** via `wc` hydrate hooks.
- **Heavy or optional engines are lazy-loaded** (Mermaid, KaTeX extensions,
  charts, plots, graph viz) to protect bundle-size budgets (`PROJECT_PLAN.md` §7).
- **App-level navigation & docs tooling** (category G 74–79, category I) belong to
  the application shell and multi-document mode in **P4/P6/P7**.
- **Security applies throughout:** all embedded media/HTML (28, 29, 61–70 render
  targets) go through DOMPurify and/or sandboxed iframes per `PROJECT_PLAN.md` §6.
- Every feature maps to a plugin or component, so this list doubles as the
  implementation backlog. New features are added by writing a plugin against the
  same pipeline described in `ARCHITECTURE.md` §2.
