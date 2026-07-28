# Architecture

Deep dive on package layout, the render pipeline, the streaming model, and the
Ollama integration. Companion to [`PROJECT_PLAN.md`](./PROJECT_PLAN.md).

> ⚠️ All code here is **illustrative example** only — it pins down interfaces and
> data flow, it is not the shipped implementation.

---

## 1. Package layout & responsibilities

```
packages/
├─ core/            @md-renderer/core
│   ├─ pipeline     parse → transform (plugins) → sanitize → HTML string
│   ├─ plugins/     thinking, code, headings/toc, math, mermaid, callouts
│   ├─ stream/      buffer, block splitter, tolerant preprocessor
│   └─ sanitize/    DOMPurify config + allowlist
│
├─ web-component/   @md-renderer/web-component  (Lit, Shadow DOM)
│   ├─ md-view      renders a Markdown string (static or streaming)
│   ├─ ai-chat      full chat surface (message list + composer + settings)
│   └─ styles/      design tokens (CSS custom properties), themes, animations
│
├─ app/             the localhost application (Vite)
│   ├─ providers/   LLMProvider implementations (Ollama first)
│   ├─ store/       IndexedDB (chats) + localStorage (settings)
│   └─ ui/          sidebar, model picker, param panel, prompt editor
│
├─ server/          Bun/Node: static host + Ollama reverse proxy
│   └─ proxy        NDJSON → SSE, CORS handling, origin allowlist
│
└─ extension/       content script + site adapters + shadow overlay
```

**Rule:** dependencies only point "down" (`app` → `web-component` → `core`).
`core` has no DOM-framework dependency and can run in a Web Worker or Node.

---

## 2. Render pipeline (core)

A single, plugin-driven pipeline turns a Markdown string into safe HTML plus
"hydration hooks" (post-insert wiring for copy buttons, iframe previews,
collapsible panels, Mermaid render).

```
 raw markdown ──▶ preprocess ──▶ markdown-it parse ──▶ plugin transforms ──▶ render HTML ──▶ SANITIZE ──▶ hydrate
   (string)      (tolerant,      (tokens)             (thinking, code,       (string)        (DOMPurify)   (DOM wiring)
                  normalize)                           headings, math…)
```

### Example: the shape of the public core API

```ts
// EXAMPLE ONLY — interface sketch
export interface RenderResult {
  html: string;                 // sanitized, safe to insert
  headings: TocEntry[];         // for TOC/anchors
  hydrate(root: ParentNode): void; // wire copy buttons, previews, mermaid, etc.
}

export interface RenderOptions {
  highlighter?: 'hljs' | 'shiki';
  thinking?: { forms: string[]; autoCollapse: boolean };
  allowHtmlPreview?: boolean;   // enables sandboxed iframe preview tab
  headingBaseLevel?: number;    // clamp model headings under app chrome
}

export function render(md: string, opts?: RenderOptions): RenderResult;
```

### Plugins are where features live

- `thinking` — turns recognized reasoning spans into collapsible panels + timing.
- `code` — chrome (lang label, copy, filename, line numbers), diff tinting,
  HTML preview tab, worker-based highlighting.
- `headings` — slug ids, anchors, TOC extraction, level clamping.
- `math` — KaTeX for `$`/`$$`.
- `mermaid` — lazy-loaded diagram rendering during hydrate.
- `callouts` — optional admonitions (`> [!NOTE]`).

---

## 3. Streaming model (the hard part, in detail)

### 3.1 Block-aware incremental rendering

The message buffer is split into **committed blocks** (stable, cached HTML) and
one **hot block** (the trailing, still-growing block). Only the hot block is
re-rendered per frame.

```
buffer:  [ # Title ][ paragraph ][ ```ts … (still open) ] ← hot block re-renders
          └───────── committed, cached ─────────┘  └── only this re-parses/highlights
```

When a block clearly closes (blank line boundary, closing fence, closing
`</think>`), it graduates from *hot* to *committed* and its HTML is frozen.

### 3.2 Tolerant preprocessing

Before parsing the hot region, virtually balance open constructs so partial
output renders cleanly; drop the virtual close when the real token arrives.

```ts
// EXAMPLE ONLY
function closeOpenConstructs(buf: string): string {
  let out = buf;
  if (countFences(out) % 2 === 1) out += '\n```';       // open code fence
  if (isOpen(out, '<think>', '</think>')) out += '</think>';
  if (countDollarBlocks(out) % 2 === 1) out += '$$';    // open math block
  return out;
}
```

### 3.3 Frame batching

Tokens arrive faster than we should paint. Coalesce with `requestAnimationFrame`.

```ts
// EXAMPLE ONLY
let pending = '';
let scheduled = false;
function onToken(t: string) {
  pending += t;
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    appendToBuffer(pending); pending = '';
    renderHotBlock();          // only the hot block
    scheduled = false;
  });
}
```

### 3.4 Thinking-block state machine

```
   idle ──"<think>"──▶ thinking(open, shimmer, timer start)
   thinking ──"</think>"──▶ done(collapse per pref, "Thought for Ns")
   thinking ──stream ends w/o close──▶ done(graceful, mark incomplete)
```

---

## 4. Ollama integration

### 4.1 Why a local proxy is the default

Browsers block cross-origin requests to `http://localhost:11434` unless Ollama
is started with `OLLAMA_ORIGINS` allowing the app origin. To make it "just work,"
`packages/server` reverse-proxies Ollama on the app's own origin and converts
Ollama's **NDJSON** stream to **SSE** for the browser. A "direct connect" mode is
offered for users who prefer to set `OLLAMA_ORIGINS` themselves.

```
browser ──/api/chat──▶ our server (same origin) ──▶ Ollama :11434
        ◀── SSE ──────  (NDJSON→SSE transform)  ◀── NDJSON
```

### 4.2 Endpoints used

| Endpoint | Use |
|----------|-----|
| `GET /api/tags` | list installed models (model picker) |
| `POST /api/show` | model details: context length, capabilities |
| `POST /api/chat` (`stream:true`) | streaming chat with system + messages + options |
| `POST /api/pull` | optional: download models with progress |

### 4.3 Provider abstraction

```ts
// EXAMPLE ONLY — one interface, many backends
export interface LLMProvider {
  listModels(): Promise<ModelInfo[]>;
  chatStream(req: ChatRequest, onToken: (t: string) => void,
             signal: AbortSignal): Promise<ChatResult>;
}
// OllamaProvider first; OpenAICompatibleProvider later reuses the same UI.
```

### 4.4 Example request payload (Ollama `/api/chat`)

```json
{
  "model": "llama3.1",
  "stream": true,
  "messages": [
    { "role": "system", "content": "<built-in MD-AI system prompt>" },
    { "role": "user", "content": "Explain quicksort with code." }
  ],
  "options": { "temperature": 0.7, "num_ctx": 8192 },
  "keep_alive": "5m"
}
```

Streaming response is newline-delimited JSON objects, each with a
`message.content` delta and a final object where `done: true`.

---

## 5. Theming & isolation

- All components render into **Shadow DOM** → host-page CSS can't leak in or out.
- **Design tokens** as CSS custom properties (`--md-bg`, `--md-code-bg`,
  `--md-accent`, motion durations…) → themes are token swaps.
- Light/dark/system; a couple of code themes mapped to the highlighter.
- Animations live in a single stylesheet, all gated behind a
  `prefers-reduced-motion` / user "reduce motion" flag.

---

## 6. Build targets from one source

| Target | Tooling |
|--------|---------|
| npm libs (`core`, `web-component`) | Vite library mode → ESM + types |
| Localhost app | Vite app build, served by `packages/server` |
| Single-file portable | `vite-plugin-singlefile` (hljs mode, assets inlined) |
| Extension / userscript | Vite + content-script entry; site adapters bundled |

---

## 7. Data & persistence

- **Chats:** IndexedDB (conversations, messages, timestamps, model, params).
- **Settings:** localStorage (theme, motion, system prompt, Ollama URL, defaults).
- **Export/Import:** JSON for portability and backup.
- No server-side database in v1; the proxy is stateless.
