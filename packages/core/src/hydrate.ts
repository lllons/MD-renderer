/**
 * Wire up interactive behavior on already-rendered output. Currently: copy-code
 * buttons. Safe to call only where a DOM exists (browser); returns a cleanup
 * function that removes the listeners.
 *
 * Fuller interactivity (collapsible blocks, sortable tables, diagrams) arrives
 * with the web component in a later phase; this keeps the core output usable today.
 */
export function hydrate(root: ParentNode): () => void {
  const onClick = (event: Event) => {
    const target = event.target as Element | null;
    const button = target?.closest?.(".md-code-copy");
    if (!button) return;

    const block = button.closest(".md-code-block");
    const code = block?.querySelector("code");
    if (!code) return;

    const text = code.textContent ?? "";
    void navigator.clipboard?.writeText(text).then(() => {
      const prev = button.textContent;
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = prev;
      }, 1500);
    });
  };

  root.addEventListener("click", onClick as EventListener);
  return () => root.removeEventListener("click", onClick as EventListener);
}
