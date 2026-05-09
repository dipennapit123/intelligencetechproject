"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ContentEntry = {
  key: string;
  updated_at: string;
};

const SECTION_META: Record<string, { label: string; desc: string; icon: string }> = {
  hero: { label: "Hero Section", desc: "Homepage hero: headline, body, CTAs, and image.", icon: "view_carousel" },
  about: { label: "About Section", desc: "About pillars (mission/vision/culture) and stats.", icon: "info" },
  nav_links: { label: "Navigation", desc: "Top nav links, sign-in, and CTA button.", icon: "menu" },
  footer: { label: "Footer", desc: "Footer columns, social links, and copyright.", icon: "call_to_action" },
  contact_info: { label: "Contact Page", desc: "Contact details: email, address, hours.", icon: "contact_mail" },
  privacy_policy: { label: "Privacy Policy", desc: "Privacy sections, bullets, and contact.", icon: "policy" },
};

export default function ContentHubPage() {
  const [entries, setEntries] = React.useState<ContentEntry[]>([]);
  const [busy, setBusy] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error("Not authenticated");
        const res = await apiFetch<{ entries: ContentEntry[] }>("/api/admin/site-content", token);
        setEntries(res.entries);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setBusy(false);
      }
    }
    void load();
  }, []);

  const allKeys = Object.keys(SECTION_META);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Site Content</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            Manage the content displayed on the public website. Each section has dedicated fields.
          </p>
        </div>
      </div>

      {error && <div className="mt-4 rounded-xl bg-error-container/50 px-4 py-2.5 text-sm text-on-error-container">{error}</div>}

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {busy ? (
          <Card className="p-6 text-sm text-on-surface-variant">Loading…</Card>
        ) : (
          allKeys.map((key) => {
            const meta = SECTION_META[key];
            const entry = entries.find((e) => e.key === key);
            return (
              <Card key={key} className="group flex flex-col p-6 transition hover:ring-primary/15">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container/12 text-primary-container transition group-hover:bg-primary-container/20">
                    <span className="material-symbols-outlined text-[22px]">{meta.icon}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">{key}</div>
                    <div className="mt-0.5 text-lg font-semibold tracking-tight text-on-surface">{meta.label}</div>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-sm text-on-surface-variant leading-relaxed">{meta.desc}</p>
                {entry && (
                  <p className="mt-2 text-xs text-on-surface-variant/70">
                    Updated: {new Date(entry.updated_at).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-4">
                  <Button href={`/app/content/${key}`} size="sm" variant="secondary">
                    <span className="material-symbols-outlined mr-1.5 text-[16px]">edit</span>
                    Edit section
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
