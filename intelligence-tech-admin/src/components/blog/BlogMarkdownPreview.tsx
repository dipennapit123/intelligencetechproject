"use client";

import * as React from "react";

function normalizeHref(raw: string): string {
  const href = raw.trim();
  if (!href) return "#";
  if (/^https?:\/\//i.test(href)) return href;
  if (/^mailto:/i.test(href)) return href;
  return `https://${href}`;
}

/** Renders `**bold**` and `[label](url)` inside a line (for admin preview only). */
export function renderInlineMarkdown(text: string): React.ReactNode {
  const nodes = renderLinkParts(text, "root");
  return nodes.length ? <>{nodes}</> : text;
}

function renderLinkParts(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let mi = 0;
  while ((m = linkRe.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(...renderBoldParts(text.slice(last, m.index), `${keyPrefix}-b-${mi}`));
    }
    const href = normalizeHref(m[2]);
    nodes.push(
      <a
        key={`${keyPrefix}-a-${mi}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline underline-offset-2"
      >
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
    mi++;
  }
  if (last < text.length) {
    nodes.push(...renderBoldParts(text.slice(last), `${keyPrefix}-tail`));
  }
  return nodes.length ? nodes : renderBoldParts(text, keyPrefix);
}

function renderBoldParts(s: string, keyPrefix: string): React.ReactNode[] {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-on-surface">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

export function BlogMarkdownPreview({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="prose-it max-h-[520px] overflow-y-auto rounded-xl border border-primary/8 bg-surface-container-low/50 px-5 py-4 text-sm leading-relaxed text-on-surface">
      {lines.map((line, i) => {
        const trimmed = line.trimStart();
        if (trimmed.startsWith("### "))
          return (
            <h4 key={i} className="mt-4 mb-1 text-base font-semibold text-on-surface">
              {renderInlineMarkdown(trimmed.slice(4))}
            </h4>
          );
        if (trimmed.startsWith("## "))
          return (
            <h3 key={i} className="mt-5 mb-1 text-lg font-semibold text-on-surface">
              {renderInlineMarkdown(trimmed.slice(3))}
            </h3>
          );
        if (trimmed.startsWith("# "))
          return (
            <h2 key={i} className="mt-6 mb-2 text-xl font-bold text-on-surface">
              {renderInlineMarkdown(trimmed.slice(2))}
            </h2>
          );
        if (trimmed.startsWith("- ") || trimmed.startsWith("* "))
          return (
            <li key={i} className="ml-4 list-disc text-on-surface-variant">
              {renderInlineMarkdown(trimmed.slice(2))}
            </li>
          );
        if (trimmed === "") return <div key={i} className="h-3" />;
        return (
          <p key={i} className="text-on-surface-variant">
            {renderInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}
