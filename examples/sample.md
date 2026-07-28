# MD-renderer — Phase 1 demo

A quick tour of what `@md-renderer/core` renders today. This document was turned
into the HTML you're viewing by `render()` — headings, code, tables, and task
lists all handled, with the output run through DOMPurify.

## Text formatting

You get **bold**, *italic*, ***both***, ~~strikethrough~~, `inline code`, and
[external links](https://example.com) that open safely in a new tab.

> Blockquotes work too — handy for callouts and quoted context.

## Code blocks

Fenced blocks get a language label, a copy button, line numbers, an optional
filename, and line highlighting:

```ts title="server.ts" {2}
const port = 11434;
const model = "llama3.1"; // this line is highlighted
export { port, model };
```

Diffs are tinted line-by-line:

```diff
 function greet(name) {
-  return "hi " + name;
+  return `hello ${name}`;
 }
```

HTML source is shown highlighted, never executed:

```html
<button class="primary" onclick="alert('safe: shown as text')">Click</button>
```

## A table

| Feature        | Status | Phase |
| -------------- | :----: | ----- |
| Headings + TOC |   ✅   | 1     |
| Code chrome    |   ✅   | 1     |
| Sanitization   |   ✅   | 1     |
| Thinking panel |   ⏳   | 2     |

## Task list

- [x] markdown-it pipeline + GFM
- [x] Headings, anchors, level clamp, TOC
- [x] Code blocks + highlight.js + diff
- [x] DOMPurify + XSS corpus
- [ ] Streaming & thinking panels (Phase 2)

### Safety check

The following hostile input is neutralized on the way in:
<img src=x onerror="alert('xss')"> — the handler is stripped, nothing runs.
