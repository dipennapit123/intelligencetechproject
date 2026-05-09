"use client";

import * as React from "react";

import { Input, Textarea } from "@/components/ui/Input";

import {
  DEFAULT_ABOUT,
  DEFAULT_CONTACT,
  DEFAULT_FOOTER,
  DEFAULT_HERO,
  DEFAULT_NAV,
  DEFAULT_PRIVACY,
  DEFAULT_PRIVACY_SECTIONS,
} from "./defaults";
import { PrivacySectionsEditor } from "./PrivacySectionsEditor";

function asObj(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

/** Strips trailing commas before `}` or `]` (invalid in JSON) so pasted CMS JSON still parses. */
function parseJsonLenient(raw: string): unknown {
  let s = raw.trim();
  let prev: string;
  do {
    prev = s;
    s = s.replace(/,(\s*[}\]])/g, "$1");
  } while (s !== prev);
  return JSON.parse(s);
}

function mergeHero(raw: unknown) {
  const o = asObj(raw);
  const p = asObj(o.primaryCta);
  const s = asObj(o.secondaryCta);
  return {
    eyebrow: String(o.eyebrow ?? DEFAULT_HERO.eyebrow),
    headlineLine1: String(o.headlineLine1 ?? DEFAULT_HERO.headlineLine1),
    headlineLine2: String(o.headlineLine2 ?? DEFAULT_HERO.headlineLine2),
    body: String(o.body ?? DEFAULT_HERO.body),
    primaryCta: {
      label: String(p.label ?? DEFAULT_HERO.primaryCta.label),
      href: String(p.href ?? DEFAULT_HERO.primaryCta.href),
    },
    secondaryCta: {
      label: String(s.label ?? DEFAULT_HERO.secondaryCta.label),
      href: String(s.href ?? DEFAULT_HERO.secondaryCta.href),
    },
    imageUrl: String(o.imageUrl ?? DEFAULT_HERO.imageUrl),
    imageAlt: String(o.imageAlt ?? DEFAULT_HERO.imageAlt),
  };
}

function HeroFields({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const d = mergeHero(value);
  const set = (patch: Partial<typeof d>) => onChange({ ...d, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-on-surface">Eyebrow (small label above headline)</label>
        <div className="mt-1">
          <Input value={d.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-on-surface">Headline line 1</label>
          <Input className="mt-1" value={d.headlineLine1} onChange={(e) => set({ headlineLine1: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium text-on-surface">Headline line 2 (accent)</label>
          <Input className="mt-1" value={d.headlineLine2} onChange={(e) => set({ headlineLine2: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-on-surface">Body</label>
        <Textarea className="mt-1" rows={4} value={d.body} onChange={(e) => set({ body: e.target.value })} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-primary/10 bg-surface-container-low/50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Primary button</div>
          <div className="mt-3 space-y-2">
            <Input placeholder="Label" value={d.primaryCta.label} onChange={(e) => set({ primaryCta: { ...d.primaryCta, label: e.target.value } })} />
            <Input placeholder="Link (e.g. /products)" value={d.primaryCta.href} onChange={(e) => set({ primaryCta: { ...d.primaryCta, href: e.target.value } })} />
          </div>
        </div>
        <div className="rounded-xl border border-primary/10 bg-surface-container-low/50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Secondary button</div>
          <div className="mt-3 space-y-2">
            <Input placeholder="Label" value={d.secondaryCta.label} onChange={(e) => set({ secondaryCta: { ...d.secondaryCta, label: e.target.value } })} />
            <Input placeholder="Link" value={d.secondaryCta.href} onChange={(e) => set({ secondaryCta: { ...d.secondaryCta, href: e.target.value } })} />
          </div>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-on-surface">Hero image URL</label>
        <Input className="mt-1" value={d.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://..." />
      </div>
      <div>
        <label className="text-sm font-medium text-on-surface">Image description (accessibility)</label>
        <Textarea className="mt-1" rows={2} value={d.imageAlt} onChange={(e) => set({ imageAlt: e.target.value })} />
      </div>
    </div>
  );
}

function mergeNav(raw: unknown) {
  const o = asObj(raw);
  const links = Array.isArray(o.mainLinks) ? o.mainLinks : DEFAULT_NAV.mainLinks;
  const mainLinks = links.map((x) => {
    const l = asObj(x);
    return { label: String(l.label ?? ""), href: String(l.href ?? "") };
  });
  return {
    mainLinks: mainLinks.length ? mainLinks : [...DEFAULT_NAV.mainLinks],
    signInLabel: String(o.signInLabel ?? DEFAULT_NAV.signInLabel),
    signInHref: String(o.signInHref ?? DEFAULT_NAV.signInHref),
    ctaLabel: String(o.ctaLabel ?? DEFAULT_NAV.ctaLabel),
    ctaHref: String(o.ctaHref ?? DEFAULT_NAV.ctaHref),
  };
}

function NavFields({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const d = mergeNav(value);
  const setLink = (i: number, patch: Partial<(typeof d.mainLinks)[0]>) => {
    const next = d.mainLinks.map((l, j) => (j === i ? { ...l, ...patch } : l));
    onChange({ ...d, mainLinks: next });
  };
  const addLink = () => onChange({ ...d, mainLinks: [...d.mainLinks, { label: "", href: "/" }] });
  const removeLink = (i: number) => onChange({ ...d, mainLinks: d.mainLinks.filter((_, j) => j !== i) });

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-on-surface">Top navigation links</span>
          <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={addLink}>
            + Add link
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {d.mainLinks.map((link, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2">
              <div className="min-w-[120px] flex-1">
                <label className="text-xs text-on-surface-variant">Label</label>
                <Input className="mt-0.5" value={link.label} onChange={(e) => setLink(i, { label: e.target.value })} />
              </div>
              <div className="min-w-[140px] flex-2">
                <label className="text-xs text-on-surface-variant">URL</label>
                <Input className="mt-0.5" value={link.href} onChange={(e) => setLink(i, { href: e.target.value })} />
              </div>
              <button type="button" className="mb-1 text-xs text-on-surface-variant hover:text-red-600" onClick={() => removeLink(i)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-on-surface">Sign-in label</label>
          <Input className="mt-1" value={d.signInLabel} onChange={(e) => onChange({ ...d, signInLabel: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium text-on-surface">Sign-in URL</label>
          <Input className="mt-1" value={d.signInHref} onChange={(e) => onChange({ ...d, signInHref: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium text-on-surface">CTA button label</label>
          <Input className="mt-1" value={d.ctaLabel} onChange={(e) => onChange({ ...d, ctaLabel: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium text-on-surface">CTA button URL</label>
          <Input className="mt-1" value={d.ctaHref} onChange={(e) => onChange({ ...d, ctaHref: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function mergeAbout(raw: unknown) {
  const o = asObj(raw);
  const pillars = Array.isArray(o.pillars) ? o.pillars.map((p) => {
    const x = asObj(p);
    return { icon: String(x.icon ?? ""), title: String(x.title ?? ""), desc: String(x.desc ?? "") };
  }) : DEFAULT_ABOUT.pillars;
  const stats = Array.isArray(o.stats) ? o.stats.map((p) => {
    const x = asObj(p);
    return { value: String(x.value ?? ""), label: String(x.label ?? "") };
  }) : DEFAULT_ABOUT.stats;
  return {
    label: String(o.label ?? DEFAULT_ABOUT.label),
    heading: String(o.heading ?? DEFAULT_ABOUT.heading),
    body: String(o.body ?? DEFAULT_ABOUT.body),
    pillars: pillars.length ? pillars : [...DEFAULT_ABOUT.pillars],
    stats: stats.length ? stats : [...DEFAULT_ABOUT.stats],
  };
}

function AboutFields({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const d = mergeAbout(value);
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-on-surface">Section label</label>
        <Input className="mt-1" value={d.label} onChange={(e) => onChange({ ...d, label: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium text-on-surface">Heading</label>
        <Input className="mt-1" value={d.heading} onChange={(e) => onChange({ ...d, heading: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium text-on-surface">Body</label>
        <Textarea className="mt-1" rows={4} value={d.body} onChange={(e) => onChange({ ...d, body: e.target.value })} />
      </div>
      <div>
        <div className="text-sm font-semibold text-on-surface">Pillars (mission / vision / culture)</div>
        <div className="mt-3 space-y-4">
          {d.pillars.map((p, i) => (
            <div key={i} className="rounded-xl border border-primary/10 p-4">
              <div className="grid gap-2 md:grid-cols-3">
                <Input
                  placeholder="Icon name (Material)"
                  value={p.icon}
                  onChange={(e) => {
                    const next = [...d.pillars];
                    next[i] = { ...p, icon: e.target.value };
                    onChange({ ...d, pillars: next });
                  }}
                />
                <Input
                  placeholder="Title"
                  className="md:col-span-2"
                  value={p.title}
                  onChange={(e) => {
                    const next = [...d.pillars];
                    next[i] = { ...p, title: e.target.value };
                    onChange({ ...d, pillars: next });
                  }}
                />
              </div>
              <Textarea
                className="mt-2"
                rows={2}
                placeholder="Description"
                value={p.desc}
                onChange={(e) => {
                  const next = [...d.pillars];
                  next[i] = { ...p, desc: e.target.value };
                  onChange({ ...d, pillars: next });
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold text-on-surface">Stats</div>
        <div className="mt-3 space-y-2">
          {d.stats.map((s, i) => (
            <div key={i} className="flex gap-2">
              <Input
                className="w-24"
                value={s.value}
                onChange={(e) => {
                  const next = [...d.stats];
                  next[i] = { ...s, value: e.target.value };
                  onChange({ ...d, stats: next });
                }}
              />
              <Input
                className="flex-1"
                value={s.label}
                onChange={(e) => {
                  const next = [...d.stats];
                  next[i] = { ...s, label: e.target.value };
                  onChange({ ...d, stats: next });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function mergeFooter(raw: unknown) {
  const o = asObj(raw);
  const socialLinks = Array.isArray(o.socialLinks)
    ? o.socialLinks.map((x) => {
        const s = asObj(x);
        return { platform: String(s.platform ?? ""), url: String(s.url ?? "") };
      })
    : DEFAULT_FOOTER.socialLinks;
  const columns = Array.isArray(o.columns)
    ? o.columns.map((col) => {
        const c = asObj(col);
        const links = Array.isArray(c.links)
          ? c.links.map((l) => {
              const x = asObj(l);
              return { label: String(x.label ?? ""), href: String(x.href ?? "") };
            })
          : [];
        return { title: String(c.title ?? ""), links };
      })
    : DEFAULT_FOOTER.columns;
  return {
    tagline: String(o.tagline ?? DEFAULT_FOOTER.tagline),
    socialLinks: socialLinks.length ? socialLinks : [...DEFAULT_FOOTER.socialLinks],
    columns: columns.length ? columns : [...DEFAULT_FOOTER.columns],
    copyright: String(o.copyright ?? DEFAULT_FOOTER.copyright),
  };
}

function FooterFields({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const d = mergeFooter(value);
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-on-surface">Tagline</label>
        <Textarea className="mt-1" rows={2} value={d.tagline} onChange={(e) => onChange({ ...d, tagline: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium text-on-surface">Copyright line</label>
        <Input className="mt-1" value={d.copyright} onChange={(e) => onChange({ ...d, copyright: e.target.value })} />
      </div>
      <div>
        <div className="text-sm font-semibold text-on-surface">Social links</div>
        <div className="mt-2 space-y-2">
          {d.socialLinks.map((s, i) => (
            <div key={i} className="flex gap-2">
              <Input
                className="w-32"
                placeholder="platform"
                value={s.platform}
                onChange={(e) => {
                  const next = [...d.socialLinks];
                  next[i] = { ...s, platform: e.target.value };
                  onChange({ ...d, socialLinks: next });
                }}
              />
              <Input
                className="flex-1"
                placeholder="https://"
                value={s.url}
                onChange={(e) => {
                  const next = [...d.socialLinks];
                  next[i] = { ...s, url: e.target.value };
                  onChange({ ...d, socialLinks: next });
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold text-on-surface">Footer columns</div>
        <div className="mt-3 space-y-4">
          {d.columns.map((col, ci) => (
            <div key={ci} className="rounded-xl border border-primary/10 p-4">
              <Input
                className="font-medium"
                placeholder="Column title"
                value={col.title}
                onChange={(e) => {
                  const next = [...d.columns];
                  next[ci] = { ...col, title: e.target.value };
                  onChange({ ...d, columns: next });
                }}
              />
              <div className="mt-2 space-y-2">
                {col.links.map((link, li) => (
                  <div key={li} className="flex gap-2">
                    <Input
                      placeholder="Label"
                      value={link.label}
                      onChange={(e) => {
                        const next = [...d.columns];
                        const links = [...next[ci].links];
                        links[li] = { ...link, label: e.target.value };
                        next[ci] = { ...next[ci], links };
                        onChange({ ...d, columns: next });
                      }}
                    />
                    <Input
                      placeholder="URL"
                      className="flex-1"
                      value={link.href}
                      onChange={(e) => {
                        const next = [...d.columns];
                        const links = [...next[ci].links];
                        links[li] = { ...link, href: e.target.value };
                        next[ci] = { ...next[ci], links };
                        onChange({ ...d, columns: next });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function mergeContact(raw: unknown) {
  const o = asObj(raw);
  const details = Array.isArray(o.details)
    ? o.details.map((x) => {
        const d = asObj(x);
        return { icon: String(d.icon ?? ""), label: String(d.label ?? ""), value: String(d.value ?? "") };
      })
    : DEFAULT_CONTACT.details;
  return {
    eyebrow: String(o.eyebrow ?? DEFAULT_CONTACT.eyebrow),
    heading: String(o.heading ?? DEFAULT_CONTACT.heading),
    body: String(o.body ?? DEFAULT_CONTACT.body),
    details: details.length ? details : [...DEFAULT_CONTACT.details],
  };
}

function ContactFields({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const d = mergeContact(value);
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-on-surface">Eyebrow</label>
        <Input className="mt-1" value={d.eyebrow} onChange={(e) => onChange({ ...d, eyebrow: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium text-on-surface">Heading</label>
        <Input className="mt-1" value={d.heading} onChange={(e) => onChange({ ...d, heading: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium text-on-surface">Intro body</label>
        <Textarea className="mt-1" rows={4} value={d.body} onChange={(e) => onChange({ ...d, body: e.target.value })} />
      </div>
      <div>
        <div className="text-sm font-semibold text-on-surface">Contact rows</div>
        <div className="mt-2 space-y-3">
          {d.details.map((row, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-primary/10 p-3 md:grid-cols-3">
              <Input
                placeholder="Icon"
                value={row.icon}
                onChange={(e) => {
                  const next = [...d.details];
                  next[i] = { ...row, icon: e.target.value };
                  onChange({ ...d, details: next });
                }}
              />
              <Input
                placeholder="Label"
                value={row.label}
                onChange={(e) => {
                  const next = [...d.details];
                  next[i] = { ...row, label: e.target.value };
                  onChange({ ...d, details: next });
                }}
              />
              <Input
                className="md:col-span-1"
                placeholder="Value"
                value={row.value}
                onChange={(e) => {
                  const next = [...d.details];
                  next[i] = { ...row, value: e.target.value };
                  onChange({ ...d, details: next });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function mergePrivacy(raw: unknown) {
  const o = asObj(raw);
  const rawSections = o.sections;
  const sections = Array.isArray(rawSections) ? rawSections : DEFAULT_PRIVACY_SECTIONS;
  return {
    lastUpdated: String(o.lastUpdated ?? DEFAULT_PRIVACY.lastUpdated),
    intro: String(o.intro ?? DEFAULT_PRIVACY.intro),
    sections,
    contactEmail: String(o.contactEmail ?? DEFAULT_PRIVACY.contactEmail),
    contactAddress: String(o.contactAddress ?? DEFAULT_PRIVACY.contactAddress),
  };
}

function PrivacyFields({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const d = mergePrivacy(value);

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-on-surface">Last updated (display text)</label>
        <Input className="mt-1" value={d.lastUpdated} onChange={(e) => onChange({ ...d, lastUpdated: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium text-on-surface">Introduction</label>
        <Textarea className="mt-1" rows={4} value={d.intro} onChange={(e) => onChange({ ...d, intro: e.target.value })} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-on-surface">Contact email (shown in policy)</label>
          <Input className="mt-1" value={d.contactEmail} onChange={(e) => onChange({ ...d, contactEmail: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium text-on-surface">Contact address line</label>
          <Input className="mt-1" value={d.contactAddress} onChange={(e) => onChange({ ...d, contactAddress: e.target.value })} />
        </div>
      </div>
      <PrivacySectionsEditor
        sections={d.sections as unknown[]}
        onChange={(next) => onChange({ ...d, sections: next })}
      />
    </div>
  );
}

function JsonFallback({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const [text, setText] = React.useState(() => JSON.stringify(value ?? {}, null, 2));
  React.useEffect(() => {
    setText(JSON.stringify(value ?? {}, null, 2));
  }, [value]);
  return (
    <div>
      <p className="text-sm text-on-surface-variant">No visual editor for this key yet. Edit JSON below.</p>
      <Textarea
        className="mt-4 font-mono text-xs"
        rows={20}
        value={text}
        onChange={(e) => {
          const t = e.target.value;
          setText(t);
          try {
            onChange(parseJsonLenient(t));
          } catch {
            /* invalid */
          }
        }}
      />
    </div>
  );
}

const FORM_KEYS = new Set(["hero", "nav_links", "about", "footer", "contact_info", "privacy_policy"]);

export function SiteContentForm({
  contentKey,
  value,
  onChange,
}: {
  contentKey: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (!FORM_KEYS.has(contentKey)) {
    return <JsonFallback value={value} onChange={onChange} />;
  }

  switch (contentKey) {
    case "hero":
      return <HeroFields value={value} onChange={onChange} />;
    case "nav_links":
      return <NavFields value={value} onChange={onChange} />;
    case "about":
      return <AboutFields value={value} onChange={onChange} />;
    case "footer":
      return <FooterFields value={value} onChange={onChange} />;
    case "contact_info":
      return <ContactFields value={value} onChange={onChange} />;
    case "privacy_policy":
      return <PrivacyFields value={value} onChange={onChange} />;
    default:
      return <JsonFallback value={value} onChange={onChange} />;
  }
}

export function hasVisualEditor(contentKey: string) {
  return FORM_KEYS.has(contentKey);
}
