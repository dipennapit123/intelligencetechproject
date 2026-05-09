"use client";

import * as React from "react";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export type PrivacySectionType = "cards" | "bullets" | "mixed" | "paragraph";

export type PrivacySection = {
  title: string;
  type: PrivacySectionType;
  body?: string;
  intro?: string;
  items?: Array<string | { title: string; body: string }>;
};

function sectionForType(type: PrivacySectionType, title: string): PrivacySection {
  switch (type) {
    case "paragraph":
      return { title, type: "paragraph", body: "" };
    case "bullets":
      return { title, type: "bullets", items: [""] };
    case "mixed":
      return { title, type: "mixed", intro: "", items: [""] };
    case "cards":
      return { title, type: "cards", items: [{ title: "", body: "" }] };
  }
}

function coerceSection(raw: unknown): PrivacySection {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return sectionForType("paragraph", "New section");
  }
  const o = raw as Record<string, unknown>;
  const title = String(o.title ?? "Section");
  const t = o.type;
  const type: PrivacySectionType =
    t === "cards" || t === "bullets" || t === "mixed" || t === "paragraph" ? t : "paragraph";

  if (type === "paragraph") {
    return { title, type: "paragraph", body: String(o.body ?? "") };
  }
  if (type === "bullets") {
    const items = Array.isArray(o.items) ? o.items.map((x) => String(x)) : [""];
    return { title, type: "bullets", items: items.length ? items : [""] };
  }
  if (type === "mixed") {
    const items = Array.isArray(o.items) ? o.items.map((x) => String(x)) : [""];
    return {
      title,
      type: "mixed",
      intro: String(o.intro ?? ""),
      items: items.length ? items : [""],
    };
  }
  const rawItems = Array.isArray(o.items) ? o.items : [];
  const cards = rawItems.map((it) => {
    if (it && typeof it === "object" && !Array.isArray(it)) {
      const c = it as Record<string, unknown>;
      return { title: String(c.title ?? ""), body: String(c.body ?? "") };
    }
    return { title: "", body: "" };
  });
  return {
    title,
    type: "cards",
    items: cards.length ? cards : [{ title: "", body: "" }],
  };
}

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function PrivacySectionsEditor({
  sections,
  onChange,
}: {
  sections: unknown[];
  onChange: (next: unknown[]) => void;
}) {
  const list = sections.length > 0 ? sections.map(coerceSection) : [];

  const update = (i: number, sec: PrivacySection) => {
    const next = [...list];
    next[i] = sec;
    onChange(next);
  };

  const setType = (i: number, newType: PrivacySectionType) => {
    const title = list[i]?.title ?? "Section";
    update(i, sectionForType(newType, title));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= list.length) return;
    const next = [...list];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    onChange(next);
  };

  const remove = (i: number) => {
    onChange(list.filter((_, j) => j !== i));
  };

  const addSection = () => {
    onChange([...list, sectionForType("paragraph", "New section")]);
  };

  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-primary/20 bg-surface-container-low/30 p-6 text-center">
        <p className="text-sm text-on-surface-variant">No policy sections yet.</p>
        <Button type="button" className="mt-3" size="sm" variant="secondary" onClick={() => addSection()}>
          Add first section
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-on-surface">Policy sections</div>
          <p className="text-xs text-on-surface-variant">
            Cards (two-column), bullet lists, intro + bullets, or a single paragraph block.
          </p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={addSection}>
          Add section
        </Button>
      </div>

      <div className="space-y-4">
        {list.map((sec, i) => (
          <div
            key={i}
            className="rounded-xl border border-primary/10 bg-surface-container-low/40 p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-48 flex-1">
                <label className="text-xs font-medium text-on-surface-variant">Section heading</label>
                <Input
                  className="mt-1"
                  value={sec.title}
                  onChange={(e) => update(i, { ...sec, title: e.target.value })}
                />
              </div>
              <div className="w-full sm:w-44">
                <label className="text-xs font-medium text-on-surface-variant">Layout</label>
                <select
                  className={cx(
                    "mt-1 flex h-11 w-full rounded-xl border border-black/10 bg-surface px-3 text-sm",
                    "text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container",
                  )}
                  value={sec.type}
                  onChange={(e) => setType(i, e.target.value as PrivacySectionType)}
                >
                  <option value="cards">Card grid</option>
                  <option value="bullets">Bullet list (checkmarks)</option>
                  <option value="mixed">Intro + bullet list</option>
                  <option value="paragraph">Single paragraph</option>
                </select>
              </div>
              <div className="ml-auto flex flex-wrap gap-1">
                <Button type="button" size="sm" variant="secondary" disabled={i === 0} onClick={() => move(i, i - 1)}>
                  Up
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={i === list.length - 1}
                  onClick={() => move(i, i + 1)}
                >
                  Down
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => remove(i)}>
                  Remove
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-3 border-t border-primary/10 pt-4">
              {sec.type === "paragraph" && (
                <div>
                  <label className="text-xs font-medium text-on-surface-variant">Body</label>
                  <Textarea
                    className="mt-1"
                    rows={5}
                    value={sec.body ?? ""}
                    onChange={(e) => update(i, { ...sec, type: "paragraph", body: e.target.value })}
                  />
                </div>
              )}

              {sec.type === "cards" && (
                <div className="space-y-3">
                  <div className="text-xs font-medium text-on-surface-variant">Cards</div>
                  {(sec.items as { title: string; body: string }[]).map((card, ci) => (
                    <div key={ci} className="space-y-2 rounded-lg border border-primary/10 p-3">
                      <Input
                        placeholder="Card title"
                        value={card.title}
                        onChange={(e) => {
                          const items = [...(sec.items as { title: string; body: string }[])];
                          items[ci] = { ...card, title: e.target.value };
                          update(i, { ...sec, type: "cards", items });
                        }}
                      />
                      <Textarea
                        rows={3}
                        placeholder="Card body"
                        value={card.body}
                        onChange={(e) => {
                          const items = [...(sec.items as { title: string; body: string }[])];
                          items[ci] = { ...card, body: e.target.value };
                          update(i, { ...sec, type: "cards", items });
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const items = (sec.items as { title: string; body: string }[]).filter((_, j) => j !== ci);
                          update(i, {
                            ...sec,
                            type: "cards",
                            items: items.length ? items : [{ title: "", body: "" }],
                          });
                        }}
                      >
                        Remove card
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      update(i, {
                        ...sec,
                        type: "cards",
                        items: [...(sec.items as { title: string; body: string }[]), { title: "", body: "" }],
                      })
                    }
                  >
                    Add card
                  </Button>
                </div>
              )}

              {sec.type === "bullets" && (
                <StringListEditor
                  label="Bullet lines"
                  items={(sec.items as string[]) ?? [""]}
                  onChange={(items) => update(i, { ...sec, type: "bullets", items })}
                />
              )}

              {sec.type === "mixed" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant">Intro paragraph</label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      value={sec.intro ?? ""}
                      onChange={(e) => update(i, { ...sec, type: "mixed", intro: e.target.value })}
                    />
                  </div>
                  <StringListEditor
                    label="Bullet lines"
                    items={(sec.items as string[]) ?? [""]}
                    onChange={(items) => update(i, { ...sec, type: "mixed", intro: sec.intro ?? "", items })}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StringListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const rows = items.length ? items : [""];
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-on-surface-variant">{label}</div>
      {rows.map((line, li) => (
        <div key={li} className="flex gap-2">
          <Input
            className="flex-1"
            value={line}
            placeholder="Line of text"
            onChange={(e) => {
              const next = [...rows];
              next[li] = e.target.value;
              onChange(next);
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              const next = rows.filter((_, j) => j !== li);
              onChange(next.length ? next : [""]);
            }}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="secondary" onClick={() => onChange([...rows, ""])}>
        Add line
      </Button>
    </div>
  );
}
