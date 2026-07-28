/**
 * A corpus of hostile inputs. After `render()` (sanitize on), none may produce
 * a dangerous element, an event-handler attribute, or a script-scheme URL —
 * verified structurally in `sanitize.xss.test.ts`, not by substring matching
 * (inert text like a literal "javascript:" in a paragraph is harmless).
 */
export const XSS_PAYLOADS: string[] = [
  `<script>alert(1)</script>`,
  `<img src=x onerror=alert(1)>`,
  `<svg onload=alert(1)></svg>`,
  `<iframe src="javascript:alert(1)"></iframe>`,
  `<div onclick="alert(1)">click</div>`,
  `<input autofocus onfocus=alert(1)>`,
  `<a href="javascript:alert(1)">link</a>`,
  `<a href="vbscript:msgbox(1)">link</a>`,
  `<a href="data:text/html,<script>alert(1)</script>">link</a>`,
  `<object data="javascript:alert(1)"></object>`,
  `<embed src="javascript:alert(1)">`,
  `<form><button formaction="javascript:alert(1)">go</button></form>`,
  `<base href="javascript:alert(1)//">`,
  `<body onload=alert(1)>`,
  `[markdown link](javascript:alert(1))`,
  `![markdown image](javascript:alert(1))`,
  `<a href="  javascript:alert(1)">leading space</a>`,
  `<a href="jAvAsCrIpT:alert(1)">mixed case</a>`,
  `<a href="java\tscript:alert(1)">tab break</a>`,
  `<math><mtext><script>alert(1)</script></mtext></math>`,
  `<a href="#" onmouseover="alert(1)">hover</a>`,
];
