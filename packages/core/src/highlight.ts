import hljs from "highlight.js";
import type { HighlightFn } from "./options.js";
import { escapeHtml } from "./util.js";

/**
 * Resolve the `highlight` option into a concrete function.
 * - `false` → plain escaped text.
 * - `"hljs"` → highlight.js when the language is known, escaped text otherwise
 *   (deterministic: no auto-detection surprises).
 * - a function → used as-is.
 */
export function resolveHighlighter(
  highlight: "hljs" | false | HighlightFn,
): HighlightFn {
  if (highlight === false) {
    return (code) => ({ value: escapeHtml(code) });
  }
  if (typeof highlight === "function") {
    return highlight;
  }
  return (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return {
        value: hljs.highlight(code, { language: lang, ignoreIllegals: true })
          .value,
      };
    }
    return { value: escapeHtml(code) };
  };
}
