# MD-renderer

**Top Markdown renderer for AI — and more.**

A portable, browser-based Markdown renderer and AI chat frontend built for how AI
actually writes: syntax-highlighted **code blocks**, proper **headings**, safe
**HTML**, collapsible **“thinking”** panels, smooth **streaming animations**, and
native **Ollama** integration with a **built-in system prompt** that teaches the
model how to format its answers.

> 🧭 **Status: planning.** This repo currently holds the full project blueprint
> (see [`docs/`](./docs)). No product code has been written yet — code samples in
> the docs are illustrative examples only.

---

## What it will do

- 🎨 **Rich rendering** — GFM Markdown, highlighted code (copy button, filenames,
  line numbers, diffs), heading anchors + TOC, and HTML shown as source *and*
  safely previewed in a sandbox.
- 🧠 **Thinking panels** — collapsible, animated reasoning blocks
  (`<think>…</think>`), “Thought for Ns”, auto-collapse — like the popular AI apps.
- ✨ **Animations** — token streaming, typewriter/fade reveals, thinking shimmer,
  smooth message entry (all respecting reduced-motion).
- 🖥️ **Runs in your browser on localhost** — a full chat UI.
- 🔌 **Ollama-native** — model discovery, streaming, parameter control, no CORS
  pain (tiny local proxy).
- 🗒️ **Built-in system prompt** — ships a default that makes models emit our
  Markdown dialect; fully editable.
- 📦 **Portable anywhere** — npm library, embeddable Web Component, single-file
  HTML, and a browser extension to enhance **other** AI chat sites.

## Project outline

```
MD-renderer/
├─ README.md              ← you are here
├─ LICENSE                ← GPL-3.0
├─ docs/                  ← the plan (start here)
│  ├─ PROJECT_PLAN.md     ← master plan: goals, tech, features, security, perf
│  ├─ ARCHITECTURE.md     ← packages, render pipeline, streaming, Ollama proxy
│  ├─ MD_AI_FORMAT.md     ← the Markdown dialect the renderer understands
│  ├─ SYSTEM_PROMPT.md    ← the built-in system prompt
│  └─ ROADMAP.md          ← phased milestones + acceptance criteria
│
└─ packages/             (planned — see ARCHITECTURE.md)
   ├─ core/              framework-agnostic Markdown → safe HTML engine
   ├─ web-component/     <md-view> / <ai-chat> custom elements (Shadow DOM)
   ├─ app/              the localhost chat application
   ├─ server/           Bun/Node static host + Ollama proxy (NDJSON→SSE)
   └─ extension/         enhance other AI chat sites with our renderer
```

## Read the plan

| Start with | For |
|-----------|-----|
| [**PROJECT_PLAN**](./docs/PROJECT_PLAN.md) | The whole picture end to end |
| [ARCHITECTURE](./docs/ARCHITECTURE.md) | How the pieces fit + the streaming model |
| [MD_AI_FORMAT](./docs/MD_AI_FORMAT.md) | The Markdown dialect spec |
| [SYSTEM_PROMPT](./docs/SYSTEM_PROMPT.md) | The built-in prompt |
| [ROADMAP](./docs/ROADMAP.md) | Phases and what "done" means |

## Planned stack

TypeScript · markdown-it · highlight.js/Shiki · DOMPurify · KaTeX · Mermaid ·
Lit (Web Components) · Vite · Bun/Node · Ollama.

## License

[GPL-3.0](./LICENSE).
