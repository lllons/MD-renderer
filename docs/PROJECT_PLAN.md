# MD-renderer — Master Project Plan

> A portable, browser-based Markdown renderer + AI chat frontend, purpose-built
> for AI output. It renders code blocks, headings, and HTML beautifully, shows
> collapsible **“thinking”** panels like popular AI chatbots, animates streaming
> tokens, plugs into **Ollama**, and ships an **inbuilt system prompt** that
> teaches the model exactly how to format its answers.

**Status:** Planning (no product code yet — this document set is the blueprint).
**License:** GPL-3.0 (see `LICENSE`).
**Scope of this document:** the complete "nuts and bolts" — goals, architecture,
technology choices, every feature broken down, security, performance,
portability strategy, and the phased roadmap. Companion docs:

| Doc | Purpose |
|-----|---------|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Package layout, data flow, render pipeline, streaming model |
| [`MD_AI_FORMAT.md`](./MD_AI_FORMAT.md) | The exact Markdown dialect the renderer understands |
| [`SYSTEM_PROMPT.md`](./SYSTEM_PROMPT.md) | The built-in system prompt that makes models emit that dialect |
| [`ROADMAP.md`](./ROADMAP.md) | Milestones, phase checklists, and acceptance criteria |
| [`FEATURES.md`](./FEATURES.md) | The full catalog of all 100 planned features, mapped to package + phase |

> ⚠️ **Code in these docs is illustrative only.** Every snippet is an *example*
> to make the design concrete — none of it is the shipped implementation.

---

## 1. Vision & goals

Build the best-looking, most faithful way to *read* AI output in a browser, and
make that renderer usable **anywhere**:

1. **Localhost app** — a full chat UI that talks to your local Ollama models.
2. **Embeddable widget** — a framework-agnostic Web Component you can drop into
   any page or your own app.
3. **Enhancer for other chatbots** — a browser extension / userscript that
   re-renders the output of *other* AI chat sites with our engine.
4. **Portable single file** — one self-contained `.html` you can open on any
   machine with no install.

### Non-negotiable feature pillars

- ✅ **Rich rendering:** GFM Markdown, syntax-highlighted **code blocks**,
  proper **headings/titles** (with anchors + TOC), **HTML** shown as source
  *and* safely previewed.
- ✅ **Thinking panels:** collapsible, animated reasoning blocks
  (`<think>…</think>` etc.), "Thought for Ns", auto-collapse on completion.
- ✅ **Animations:** token streaming, typewriter/fade reveals, shimmer while
  thinking, smooth message entry, code-block reveal — all respecting
  `prefers-reduced-motion`.
- ✅ **Ollama-native:** model discovery, streaming chat, parameter control,
  CORS-free via a tiny local proxy.
- ✅ **Built-in system prompt:** ships a strong default that instructs the model
  to use our Markdown dialect (`MD_AI_FORMAT.md`), fully editable by the user.
- ✅ **Portable & framework-agnostic:** Shadow-DOM isolation so it never fights
  a host page's CSS; builds for npm, single-file, and extension targets.

### Explicit non-goals (v1)

- Not a cloud service; everything runs locally by default.
- Not tied to one hosted provider — Ollama first, but the LLM layer is an
  interface (OpenAI-compatible adapters come later).
- Not a full Markdown *editor/WYSIWYG* first; rendering is the core. A
  split-pane live editor is a Phase-6 nicety.

---

## 2. Technology choices (with rationale)

Recommendations are opinionated defaults. Alternatives are listed so the choice
is a decision, not an accident.

| Concern | Recommended | Why | Alternatives |
|--------|-------------|-----|--------------|
| Language | **TypeScript** | Types across core + adapters, safer refactors | JS |
| Renderer core | **markdown-it** | Fast, streaming-friendly, rich plugin API, easy custom rules for thinking blocks | remark/unified (more powerful, heavier), marked (simpler, fewer hooks) |
| Syntax highlight | **Shiki** (pretty mode) + **highlight.js** (light/portable mode) | Shiki = VS Code-grade themes; hljs = tiny, no WASM, ideal for single-file build | Prism.js |
| Sanitizer | **DOMPurify** | Battle-tested XSS defense for rendered HTML | sanitize-html (Node-side) |
| Math | **KaTeX** | Fast, no network, `$…$` / `$$…$$` | MathJax (heavier) |
| Diagrams | **Mermaid** (lazy-loaded) | ` ```mermaid ` fenced diagrams | — |
| UI layer | **Lit** (Web Components) | Tiny, Shadow-DOM native → true portability into any page; no framework lock-in | React/Preact (heavier, less isolated), Svelte |
| Bundler | **Vite** | Fast dev, library + app modes, `vite-plugin-singlefile` for portable build | esbuild, Rollup |
| Local server / proxy | **Bun** (primary) with **Node** fallback | Single fast runtime, easy binary; proxies Ollama to kill CORS + converts NDJSON→SSE | Node + Express/Fastify |
| Persistence | **IndexedDB** (chats) + **localStorage** (settings) | No backend DB needed | SQLite via server (optional) |
| Tests | **Vitest** (unit) + **Playwright** (e2e/visual) | Fast unit + real-browser streaming/animation tests | Jest, Cypress |
| Lint/format | **ESLint + Prettier** | Standard | Biome (faster all-in-one) |
| CI | **GitHub Actions** | Build, test, lint, size-budget, publish | — |

**Why Web Components / Lit is the linchpin:** the request "usable anywhere and on
any AI chatbot" demands style isolation. A `<md-view>` custom element rendering
into **Shadow DOM** cannot be broken by (and cannot break) the host page's CSS —
essential for both the embeddable widget and the extension that injects into
third-party chat sites.

---

## 3. High-level architecture

A small monorepo (pnpm workspaces). Each package is independently useful.

```
md-renderer/
├─ packages/
│  ├─ core/          # framework-agnostic: Markdown → sanitized HTML + hydration hooks
│  ├─ web-component/ # <md-view> and <ai-chat> Lit custom elements (Shadow DOM)
│  ├─ app/           # the localhost chat application (Vite build)
│  ├─ server/        # Bun/Node: static host + Ollama proxy (CORS fix, NDJSON→SSE)
│  └─ extension/     # browser extension + userscript to enhance other chat sites
├─ dist/
│  └─ portable/      # single-file self-contained index.html (build output)
├─ docs/             # this plan + companion specs
└─ (tooling: package.json, pnpm-workspace.yaml, tsconfig, .github/workflows)
```

**Dependency direction:** `core` depends on nothing app-specific. `web-component`
depends on `core`. `app`, `server`, and `extension` depend on `web-component`
and/or `core`. Nothing depends "upward." See `ARCHITECTURE.md` for the full data
flow and render pipeline.

### Delivery targets from one codebase

1. **npm library** — `import { render } from '@md-renderer/core'` and/or
   `import '@md-renderer/web-component'` → `<md-view markdown="…">`.
2. **Localhost app** — `packages/app` served by `packages/server`, streaming from
   Ollama.
3. **Single-file portable** — `vite-plugin-singlefile` inlines everything into
   one `index.html` (hljs mode for zero external assets).
4. **Extension / userscript** — content script observes a target site's message
   DOM and re-renders it with our engine in a shadow root overlay.

---

## 4. Feature breakdown — the nuts and bolts

> The subsections below describe the pillar features in depth. For the **complete
> enumerated list of all 100 planned features** (core Markdown, media, code,
> tables/data, math, diagrams, navigation, advanced extensions, and professional
> documentation) — each mapped to its delivering package and roadmap phase — see
> [`FEATURES.md`](./FEATURES.md).

### 4.1 Markdown rendering (core)

- Full **GitHub-Flavored Markdown**: headings, lists, task lists, tables,
  blockquotes, links, images, autolinks, strikethrough, footnotes, hard breaks.
- **Headings/titles:** auto `id` slugs, hover **anchor** links, optional
  auto-generated **Table of Contents**, heading-level clamping (so a stray `#`
  from a model can't hijack the page's `<h1>`).
- **Inline HTML & block HTML:** parsed, then **sanitized** (DOMPurify) with an
  allowlist. Dangerous constructs (`<script>`, inline `on*` handlers,
  `javascript:` URLs) are stripped.
- **Links:** external links get `target="_blank" rel="noopener noreferrer"`;
  optional link-safety interstitial.
- **Math:** `$inline$` and `$$block$$` via KaTeX.
- **Extensible plugin bus** so thinking blocks, callouts, and diagrams are just
  plugins over the same pipeline.

### 4.2 Code blocks (a first-class citizen)

- Language-tagged fences (` ```ts `) → **syntax highlighting** (Shiki/hljs).
- Per-block chrome: **language label**, **copy button**, optional **filename
  header** (` ```ts title="server.ts" `), optional **line numbers**, **soft-wrap
  toggle**.
- **Diff highlighting** for ` ```diff ` (added/removed line tinting).
- **HTML code, two ways:**
  - ` ```html ` → highlighted **source view**.
  - Opt-in **Preview tab** → renders the HTML inside a **sandboxed `<iframe>`**
    (`sandbox="allow-scripts"` only when explicitly enabled; no
    `allow-same-origin`) so it can never touch the parent app.
- **Streaming-safe:** an unclosed fence mid-stream renders as a live, still-open
  code block instead of corrupting the rest of the document (see §4.4).

### 4.3 Thinking / reasoning panels

The "thinking" experience users expect from modern chatbots.

- **Recognized forms** (configurable): `<think>…</think>`,
  `<thinking>…</thinking>`, and a fenced ` ```thinking ` variant. Normalized in
  `MD_AI_FORMAT.md`.
- **Rendering:** a collapsible panel, visually distinct (muted, italic-ish),
  with a header like *"Thinking…"* → *"Thought for 4s"* once complete.
- **Streaming behavior:** while the block is open and streaming, it shows a
  **shimmer/pulse** animation and stays expanded; on close it **auto-collapses**
  (user preference to keep expanded). Time is measured from open→close tokens.
- **Separation of concerns:** thinking content is visually and semantically
  separated from the final answer, and is excluded from "copy answer".

### 4.4 Streaming & incremental rendering (the hard part)

AI output arrives token-by-token, so the renderer must tolerate **partial,
possibly-invalid Markdown** on every frame.

- **Transport:** Ollama streams NDJSON; the proxy re-emits as **SSE** (or the
  client reads the `ReadableStream` directly). Each chunk appends to a buffer.
- **Render strategy:** *block-aware incremental rendering.* Split the buffer into
  stable committed blocks + one "hot" trailing block. Only the hot block
  re-renders each frame; committed blocks are cached. This keeps long streams
  fast and avoids re-highlighting the whole message every token.
- **Tolerant parsing:** a preprocessor virtually closes open constructs
  (unbalanced ``` fences, open `<think>`, unterminated `$$`) so partial output
  renders cleanly; the virtual close is dropped once the real one arrives.
- **Batching:** coalesce tokens with `requestAnimationFrame` (target ~60fps);
  never render more than once per frame regardless of token rate.
- **Highlighting off the main thread:** run Shiki/hljs in a **Web Worker** for
  big blocks to keep the UI responsive.

### 4.5 Animations

- **Token reveal:** fade/slide-in of newly committed text; smooth **streaming
  caret**.
- **Message entry:** slide + fade for new messages.
- **Thinking shimmer:** animated gradient while reasoning.
- **Code reveal:** subtle highlight sweep when a block finishes.
- **Micro-interactions:** copy-button success check, collapse/expand easing.
- **Accessibility:** everything gated behind `prefers-reduced-motion`; a global
  "reduce/disable animations" setting. CSS-driven where possible for GPU-cheap
  transforms; JS only where needed (caret, shimmer timing).

### 4.6 Ollama integration

- **Discovery:** `GET /api/tags` → model picker; `POST /api/show` for context
  length & capabilities.
- **Chat:** `POST /api/chat` with `stream:true`, messages array (system + turns),
  and `options` (temperature, top_p, top_k, num_ctx, repeat_penalty, seed,
  stop, keep_alive).
- **Model management (optional UI):** `POST /api/pull` with progress; delete.
- **CORS:** the browser can't hit `:11434` from a different origin unless
  `OLLAMA_ORIGINS` is set. Default path = **route through our local proxy**
  (`packages/server`) so it "just works"; a "direct connect" mode is available
  for users who set `OLLAMA_ORIGINS`.
- **Abstraction:** an `LLMProvider` interface (`listModels`, `chatStream`,
  `abort`) with an Ollama implementation first; OpenAI-compatible adapter later
  reuses the same UI. Details in `OLLAMA_INTEGRATION` section of
  `ARCHITECTURE.md`.

### 4.7 Built-in system prompt

- Ships a **default system prompt** (`SYSTEM_PROMPT.md`) instructing the model to
  emit our Markdown dialect: fenced+language-tagged code, `<think>` for
  reasoning, real headings, tables/math where useful, and to avoid raw unsafe
  HTML.
- **User-editable** in Settings, with "reset to default" and per-chat override.
- Kept in sync with `MD_AI_FORMAT.md` so prompt and parser never drift.

### 4.8 Chat UX & app shell

- Multi-conversation sidebar; rename/delete/export.
- Message actions: copy, copy-as-Markdown, regenerate, edit-and-resend, stop.
- Model + parameter panel; per-chat system prompt.
- **Theming:** light/dark/system, CSS-variable design tokens, a couple of code
  themes.
- **Persistence:** IndexedDB history, localStorage settings; export/import JSON;
  optional "clear on exit".

---

## 5. Portability strategy ("anywhere, any chatbot")

| Mode | How it works | Primary user |
|------|--------------|--------------|
| **npm package** | `@md-renderer/core` (function) + `@md-renderer/web-component` (`<md-view>`) | Developers embedding in their own app |
| **Single-file HTML** | Vite single-file build, hljs mode, no external assets | "Open it anywhere, no install" |
| **Localhost app** | Bun/Node server + Ollama proxy | Daily driver chat UI |
| **Browser extension / userscript** | Content script watches a chat site's message DOM (via `MutationObserver`), extracts raw text, re-renders in a Shadow-DOM overlay | Enhancing ChatGPT/Claude/other web UIs |

**Shadow DOM everywhere** is what makes cross-site injection safe and consistent.
Site-specific "adapters" (CSS selectors + extraction rules) live in the extension
so support for a new chat site is a small config addition, not a rewrite.

---

## 6. Security

The renderer processes **untrusted model output** — treat it as hostile.

- **Sanitize all HTML** with DOMPurify (allowlist tags/attrs; strip `on*`,
  `javascript:`, `data:` where risky).
- **HTML preview only in a sandboxed iframe**, no `allow-same-origin`; scripts
  only when the user explicitly opts in per block.
- **Content Security Policy** on the app: no inline event handlers, constrained
  `connect-src` (Ollama origin), `frame-src` limited to the sandbox.
- **Links:** `rel="noopener noreferrer"`, external-link handling.
- **Proxy** only forwards to the configured Ollama origin — no open relay.
- **Extension:** minimal permissions, read-only DOM, never exfiltrates page data.
- **Dependency hygiene:** lockfile, `npm audit`/Dependabot in CI, pinned versions.

---

## 7. Performance targets

- First render of a typical message **< 16ms** for the hot block.
- Sustained streaming at model token rate with **no dropped frames** (rAF batch).
- Long conversations: **virtualized** message list so 1000+ messages stay smooth.
- Heavy highlighting (Shiki) and large diagrams offloaded to **Web Workers**.
- **Bundle budgets** enforced in CI: core lib tiny; single-file build kept lean
  by defaulting to hljs and lazy-loading Mermaid/KaTeX only when used.

---

## 8. Accessibility & i18n

- Semantic HTML (real headings, lists, `<button>`s), full keyboard navigation,
  visible focus, ARIA for collapsible thinking panels and live-streaming regions
  (`aria-live="polite"`).
- Color-contrast-checked themes; motion respects `prefers-reduced-motion`.
- Copy/announce streaming completion for screen readers.
- Strings externalized for later localization.

---

## 9. Testing & quality

- **Unit (Vitest):** parser rules, sanitizer allowlist, thinking-block state
  machine, tolerant/partial-Markdown rendering, streaming buffer logic.
- **E2E/visual (Playwright):** real streaming from a mock Ollama, thinking
  panel lifecycle, animation smoke tests, XSS payload corpus (must be neutralized),
  theme snapshots.
- **Fixtures:** a corpus of tricky AI outputs (nested fences, unclosed blocks,
  mixed HTML+MD, huge tables, malicious payloads).
- **CI gates:** lint, typecheck, unit, e2e, bundle-size budget, `npm audit`.

---

## 10. Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Partial-Markdown corruption during streaming | Tolerant preprocessor + block-aware incremental render (§4.4) |
| XSS from model HTML | DOMPurify + sandboxed iframe + CSP (§6) |
| Ollama CORS friction | Ship the local proxy as the default path (§4.6) |
| Bundle bloat from Shiki/KaTeX/Mermaid | hljs default + lazy-load heavy deps; CI size budget |
| Host-page CSS collisions (embed/extension) | Shadow DOM isolation everywhere (§5) |
| Thinking-tag variety across models | Configurable recognized forms, normalized in `MD_AI_FORMAT.md` |
| Third-party chat-site DOM changes (extension) | Site adapters isolated as config; graceful fallback |

---

## 11. Roadmap at a glance

Full checklists and acceptance criteria are in [`ROADMAP.md`](./ROADMAP.md).

- **Phase 0 — Scaffolding:** monorepo, tooling, CI, doc set. *(this PR)*
- **Phase 1 — Core renderer:** MD + code + headings + HTML + sanitize.
- **Phase 2 — Thinking + streaming:** tolerant partial render, thinking state machine.
- **Phase 3 — Web component + animations:** `<md-view>`, Shadow DOM theming.
- **Phase 4 — App + Ollama:** `<ai-chat>`, proxy, model picker, history.
- **Phase 5 — System prompt + format:** ship default prompt + dialect spec.
- **Phase 6 — Portability:** single-file, npm publish, extension/userscript.
- **Phase 7 — Polish:** a11y, perf, visual tests, docs site.

---

## 12. Open decisions (to confirm before Phase 1)

1. **Shiki vs highlight.js as the default** (pretty vs light). Recommendation:
   hljs default, Shiki opt-in "pretty mode."
2. **Bun vs Node** for the server. Recommendation: Bun primary, Node fallback.
3. **Extension first target site(s)** for the enhancer.
4. **Whether v1 includes the split-pane live editor** or defers to Phase 6.

These don't block Phase 0/1; they're called out so we choose deliberately.
