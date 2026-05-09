/**
 * Inserts `[label](url)` at the textarea caret. If text is selected, it becomes the link label.
 * Returns null when URL is empty.
 */
export function insertMarkdownLinkAtCaret(
  textarea: HTMLTextAreaElement,
  fullText: string,
  url: string,
  fallbackLabel: string,
): { next: string; caret: number } | null {
  const raw = url.trim();
  if (!raw) return null;
  const href =
    /^https?:\/\//i.test(raw) || /^mailto:/i.test(raw) ? raw : `https://${raw}`;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = fullText.slice(start, end);
  const base = selected.trim() || fallbackLabel.trim() || "link";
  const label = base.replace(/[[\]]/g, "");
  const insert = `[${label}](${href})`;
  const next = fullText.slice(0, start) + insert + fullText.slice(end);
  const caret = start + insert.length;
  return { next, caret };
}
