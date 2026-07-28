# Roadmap

Phased milestones with checklists and acceptance criteria. Companion to
[`PROJECT_PLAN.md`](./PROJECT_PLAN.md). Each phase is meant to be shippable on its
own.

---

## Phase 0 — Scaffolding & plan  *(this PR)*

- [x] Write the plan + companion specs (`docs/`).
- [x] Project outline in `README.md`.
- [ ] pnpm monorepo, TypeScript, ESLint/Prettier, Vitest, Playwright.
- [ ] GitHub Actions: build, lint, typecheck, test, bundle-size budget.

**Done when:** repo builds an empty workspace green in CI; docs merged.

---

## Phase 1 — Core renderer

- [ ] `@md-renderer/core`: markdown-it pipeline → sanitized HTML.
- [ ] Headings (slug ids, anchors, TOC, level clamp).
- [ ] Code blocks: lang label, copy, filename header, line numbers, diff.
- [ ] Highlighting (hljs default), Shiki behind a flag.
- [ ] HTML: sanitize (DOMPurify) + ` ```html ` source view.
- [ ] Unit tests incl. an XSS payload corpus.

**Done when:** given a Markdown string, returns safe HTML matching the dialect;
XSS corpus fully neutralized.

---

## Phase 2 — Thinking & streaming

- [ ] Thinking plugin + state machine (open/shimmer/timer/collapse).
- [ ] Recognize `<think>`, `<thinking>`, ` ```thinking `.
- [ ] Streaming buffer: block splitter + tolerant preprocessor.
- [ ] rAF frame batching; worker-based highlighting for big blocks.

**Done when:** a simulated token stream renders without corruption; thinking panel
shows "Thought for Ns" and auto-collapses.

---

## Phase 3 — Web component & animations

- [ ] `<md-view>` (Lit, Shadow DOM) — static + streaming modes.
- [ ] Design tokens, light/dark/system themes.
- [ ] Animations: token reveal, caret, shimmer, message entry, code reveal.
- [ ] `prefers-reduced-motion` + user "reduce motion" flag.

**Done when:** `<md-view>` embeds in a bare HTML page, unaffected by host CSS,
with animations that honor reduced-motion.

---

## Phase 4 — App & Ollama

- [ ] `<ai-chat>` surface: message list, composer, actions (copy/regen/stop/edit).
- [ ] `packages/server` (Bun/Node): static host + Ollama proxy (NDJSON→SSE).
- [ ] `LLMProvider` + `OllamaProvider`; model picker via `/api/tags`.
- [ ] Param panel; IndexedDB history; localStorage settings; export/import.

**Done when:** on localhost, pick an installed Ollama model and hold a streaming
conversation with thinking panels and highlighted code.

---

## Phase 5 — System prompt & format

- [ ] Ship default system prompt; editable + reset + per-chat override.
- [ ] Verify prompt ↔ `MD_AI_FORMAT.md` conformance with fixture outputs.
- [ ] "Minimal" prompt variant for small-context models.

**Done when:** default prompt reliably yields dialect-conformant output on a
couple of common local models.

---

## Phase 6 — Portability

- [ ] Single-file build (`vite-plugin-singlefile`, hljs mode).
- [ ] Publish `@md-renderer/core` + `@md-renderer/web-component` to npm.
- [ ] Extension/userscript: content script + `MutationObserver` + one site adapter
      + Shadow-DOM overlay.
- [ ] (Stretch) split-pane live Markdown editor.

**Done when:** the portable HTML opens standalone; the extension re-renders one
third-party chat site's output with our engine.

---

## Phase 7 — Polish

- [ ] Accessibility pass (ARIA live regions, keyboard, contrast).
- [ ] Performance: virtualized long chats; bundle budgets green.
- [ ] Playwright visual/e2e suite incl. streaming + XSS.
- [ ] Docs site + usage examples for each delivery mode.

**Done when:** a11y and perf targets in `PROJECT_PLAN.md` §7–8 are met and CI is
green across the matrix.

---

## Dependency order

```
Phase 0 ─▶ Phase 1 ─▶ Phase 2 ─▶ Phase 3 ─▶ Phase 4 ─▶ Phase 5 ─▶ Phase 6 ─▶ Phase 7
                                   (web component gates app + portability)
```
