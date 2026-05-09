"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";

import { SiteContentForm, hasVisualEditor } from "@/components/site-content/SiteContentForm";
import { FadeUp, ScaleIn } from "@/components/motion/AnimatedSection";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import { parseJsonPayload, validateSiteContent } from "@/lib/validation/schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/Toast";

const KEY_LABELS: Record<string, string> = {
  hero: "Hero Section",
  about: "About Section",
  nav_links: "Navigation Links",
  footer: "Footer",
  contact_info: "Contact Page",
  privacy_policy: "Privacy Policy",
};

export default function ContentEditorPage({ params }: { params: Promise<{ key: string }> }) {
  const resolvedParams = React.use(params);
  const contentKey = resolvedParams.key;
  const router = useRouter();
  const { toast } = useToast();
  const [value, setValue] = React.useState<unknown>({});
  const [busy, setBusy] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [showAdvancedJson, setShowAdvancedJson] = React.useState(false);
  const [jsonText, setJsonText] = React.useState("{}");

  React.useEffect(() => {
    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error("Not authenticated");

        const res = await apiFetch<{ value?: unknown }>(`/api/admin/site-content/${contentKey}`, token);
        const v = res && typeof res === "object" && "value" in res ? res.value : {};
        setValue(v ?? {});
        setJsonText(JSON.stringify(v ?? {}, null, 2));
      } catch {
        setValue({});
        setJsonText("{}");
      } finally {
        setBusy(false);
      }
    }
    void load();
  }, [contentKey]);

  React.useEffect(() => {
    setJsonText(JSON.stringify(value ?? {}, null, 2));
  }, [value]);

  async function save() {
    setSaving(true);
    setError(null);
    setValidationError(null);
    setSuccess(false);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      let payload: unknown;
      if (hasVisualEditor(contentKey) && !showAdvancedJson) {
        payload = value;
      } else {
        const parsed = parseJsonPayload(jsonText);
        if (!parsed.ok) {
          setValidationError(parsed.message);
          return;
        }
        payload = parsed.value;
      }

      const validated = validateSiteContent(contentKey, payload);
      if (!validated.ok) {
        setValidationError(validated.message);
        return;
      }

      await apiFetch(`/api/admin/site-content/${contentKey}`, token, {
        method: "PUT",
        body: JSON.stringify({ value: validated.data }),
      });
      setSuccess(true);
      setValue(validated.data);
      toast({ variant: "success", title: "Saved", message: "Site content updated successfully." });
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed";
      setError(msg);
      toast({ variant: "error", title: "Save failed", message: msg });
    } finally {
      setSaving(false);
    }
  }

  const label = KEY_LABELS[contentKey] ?? contentKey;
  const visual = hasVisualEditor(contentKey);

  return (
    <FadeUp>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/app/content" className="hover:text-primary transition">Site Content</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">{label}</span>
      </div>

      {/* Header bar */}
      <ScaleIn>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/8 bg-white px-5 py-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/12 text-primary-container">
              <span className="material-symbols-outlined text-[22px]">edit_note</span>
            </span>
            <div>
              <div className="font-semibold text-on-surface">{label}</div>
              <div className="text-xs text-on-surface-variant">
                {visual ? "Visual editor with structured fields" : "JSON editor"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {visual && (
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${showAdvancedJson ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}
                onClick={() => setShowAdvancedJson(!showAdvancedJson)}
              >
                <span className="material-symbols-outlined text-[14px]">code</span>
                {showAdvancedJson ? "Visual editor" : "JSON"}
              </button>
            )}
            <Button size="sm" type="button" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </ScaleIn>

      {error && <div className="mt-4 rounded-xl bg-error-container/50 px-4 py-2.5 text-sm text-on-error-container">{error}</div>}
      {validationError && (
        <div className="mt-4 rounded-xl bg-amber-500/15 px-4 py-2.5 text-sm text-amber-900">
          <span className="font-semibold">Validation: </span>
          {validationError}
        </div>
      )}
      {success && <div className="mt-4 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-800">Saved. Changes appear on the site within ~5 minutes (ISR revalidation).</div>}

      <Card className="mt-5 p-6">
        {busy ? (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            Loading content…
          </div>
        ) : (
          <div className="space-y-6">
            {visual && !showAdvancedJson ? (
              <SiteContentForm contentKey={contentKey} value={value} onChange={(v) => setValue(v)} />
            ) : (
              <div>
                {visual && <p className="mb-3 text-xs text-on-surface-variant">Raw JSON mode. Be careful with syntax.</p>}
                <Textarea
                  value={jsonText}
                  onChange={(e) => {
                    const t = e.target.value;
                    setJsonText(t);
                    try {
                      setValue(JSON.parse(t));
                    } catch {
                      /* typing */
                    }
                  }}
                  rows={24}
                  className="font-mono text-xs"
                />
              </div>
            )}
          </div>
        )}
      </Card>
    </FadeUp>
  );
}
