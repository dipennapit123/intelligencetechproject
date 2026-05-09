"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import {
  computeSeoChecks,
  seoScore,
  SeoScoreRing,
  SeoChecklist,
  LengthIndicator,
} from "@/components/dashboard/SeoScore";
import { FadeUp, SlideInLeft, SlideInRight } from "@/components/motion/AnimatedSection";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldError } from "@/components/ui/FieldError";
import { Input, Textarea } from "@/components/ui/Input";
import { BlogMarkdownPreview } from "@/components/blog/BlogMarkdownPreview";
import { apiFetch } from "@/lib/api";
import { insertMarkdownLinkAtCaret } from "@/lib/blogMarkdown";
import { blogFormSchema, type BlogFormValues } from "@/lib/validation/schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/Toast";

export type BlogPayload = {
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  featured_image: string | null;
  tags: string[];
  category: string | null;
  published: boolean;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toFormValues(i: BlogPayload): BlogFormValues {
  return {
    title: i.title,
    slug: i.slug,
    content: i.content,
    meta_title: i.meta_title ?? "",
    meta_description: i.meta_description ?? "",
    featured_image: i.featured_image ?? "",
    tags: i.tags ?? [],
    category: i.category ?? "",
    published: i.published,
  };
}

function toApiPayload(v: BlogFormValues): BlogPayload {
  const fi = v.featured_image.trim();
  const cat = v.category.trim();
  return {
    title: v.title,
    slug: v.slug,
    content: v.content,
    meta_title: v.meta_title,
    meta_description: v.meta_description,
    featured_image: fi === "" ? null : fi,
    tags: v.tags,
    category: cat === "" ? null : cat,
    published: v.published,
  };
}

export function BlogEditor({
  mode,
  blogId,
  initial,
}: {
  mode: "create" | "edit";
  blogId?: string;
  initial: BlogPayload;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(true);
  const [autoSlug, setAutoSlug] = React.useState(mode === "create");
  const [linkPanelOpen, setLinkPanelOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkFallbackText, setLinkFallbackText] = React.useState("");
  const contentTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: toFormValues(initial),
    mode: "onBlur",
  });

  React.useEffect(() => {
    reset(toFormValues(initial));
  }, [initial, reset]);

  const form = watch();
  const checks = computeSeoChecks({
    title: form.title ?? "",
    metaTitle: form.meta_title ?? "",
    metaDescription: form.meta_description ?? "",
    slug: form.slug ?? "",
    content: form.content ?? "",
  });
  const score = seoScore(checks);
  const seoIssues = checks.filter((c) => !c.pass);

  async function onValid(data: BlogFormValues) {
    setBusy(true);
    setError(null);
    setSaved(false);
    const payload = toApiPayload(data);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      if (mode === "create") {
        const res = await apiFetch<{ id: string }>("/api/admin/blog", token, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast({ variant: "success", title: "Post created", message: "Blog post created successfully." });
        router.push(`/app/blog/${res.id}`);
        router.refresh();
      } else {
        if (!blogId) throw new Error("Missing blogId");
        await apiFetch(`/api/admin/blog/${blogId}`, token, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSaved(true);
        toast({ variant: "success", title: "Saved", message: "Blog post changes were saved." });
        router.refresh();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Request failed";
      setError(msg);
      toast({ variant: "error", title: "Save failed", message: msg });
    } finally {
      setBusy(false);
    }
  }

  const { ref: contentFieldRef, ...contentFieldReg } = register("content");

  function applyInsertLink() {
    const ta = contentTextareaRef.current;
    if (!ta) return;
    const current = getValues("content") ?? "";
    const result = insertMarkdownLinkAtCaret(ta, current, linkUrl, linkFallbackText);
    if (!result) {
      setError("Enter a URL for the link.");
      return;
    }
    setError(null);
    setValue("content", result.next, { shouldDirty: true, shouldValidate: true });
    setLinkUrl("");
    setLinkFallbackText("");
    setLinkPanelOpen(false);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(result.caret, result.caret);
    });
  }

  async function uploadFeaturedImage(file: File) {
    setUploading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`${window.location.origin}/api_proxy/admin/upload`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        body: fd,
      });

      const json: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          json && typeof json === "object" && "error" in json
            ? String((json as { error: unknown }).error)
            : "Upload failed";
        throw new Error(msg);
      }

      const url =
        json && typeof json === "object" && "url" in json
          ? String((json as { url: unknown }).url)
          : null;
      if (!url) throw new Error("Upload failed");

      setValue("featured_image", url, { shouldValidate: true, shouldDirty: true });
      toast({ variant: "success", title: "Uploaded", message: "Featured image uploaded." });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setError(msg);
      toast({ variant: "error", title: "Upload failed", message: msg });
    } finally {
      setUploading(false);
    }
  }

  return (
    <FadeUp className="space-y-6">
      {/* Top actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/8 bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <SeoScoreRing score={score} />
          {seoIssues.length > 0 && (
            <span className="text-xs text-amber-700">{seoIssues.length} issue{seoIssues.length > 1 ? "s" : ""}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Controller
            name="published"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="accent-primary-container"
                />
                {field.value ? "Published" : "Draft"}
              </label>
            )}
          />
          <Button variant="secondary" size="sm" type="button" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? "Hide preview" : "Show preview"}
          </Button>
          <Button size="sm" type="button" disabled={busy} onClick={() => void handleSubmit(onValid)()}>
            {busy ? "Saving…" : saved ? "Saved ✓" : "Save"}
          </Button>
        </div>
      </div>

      {error && <div className="rounded-xl bg-error-container/50 px-4 py-2.5 text-sm text-on-error-container">{error}</div>}
      {saved && <div className="rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-800">Saved successfully.</div>}

      {/* Main editor grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <SlideInLeft className={`space-y-5 ${showPreview ? "xl:col-span-3" : "xl:col-span-4"}`}>
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-on-surface">Title</label>
                <Input
                  className={`mt-1.5 text-lg ${errors.title ? "ring-2 ring-red-500/40" : ""}`}
                  placeholder="Enter a compelling title…"
                  aria-invalid={errors.title ? "true" : "false"}
                  {...register("title", {
                    onChange: (e) => {
                      const v = e.target.value;
                      if (autoSlug) setValue("slug", slugify(v), { shouldValidate: true });
                    },
                  })}
                />
                <FieldError message={errors.title?.message} />
              </div>

              <div>
                <label className="text-sm font-semibold text-on-surface">URL slug</label>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="shrink-0 text-sm text-on-surface-variant">/blog/</span>
                  <Input
                    className={errors.slug ? "ring-2 ring-red-500/40" : ""}
                    placeholder="my-post-slug"
                    aria-invalid={errors.slug ? "true" : "false"}
                    {...register("slug", {
                      onChange: () => setAutoSlug(false),
                    })}
                  />
                </div>
                <FieldError message={errors.slug?.message} />
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-sm font-semibold text-on-surface">Content (Markdown)</label>
                  <span className="text-xs text-on-surface-variant">
                    Headings: # ## · Links: select text and insert, or use the form below
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setLinkPanelOpen((o) => !o)}
                  >
                    {linkPanelOpen ? "Close link helper" : "Insert external link"}
                  </Button>
                  <span className="text-xs text-on-surface-variant">
                    Inserts <code className="rounded bg-surface-container-high px-1 py-0.5 font-mono text-[11px]">[visible text](https://…)</code>{" "}
                    — same format the live site uses.
                  </span>
                </div>
                {linkPanelOpen && (
                  <div className="mt-3 space-y-3 rounded-xl border border-primary/12 bg-surface-container-low/50 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-on-surface-variant">URL</label>
                        <Input
                          className="mt-1"
                          placeholder="https://example.com or example.com"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              applyInsertLink();
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-on-surface-variant">
                          Link text (only if nothing is selected in the editor)
                        </label>
                        <Input
                          className="mt-1"
                          placeholder="e.g. Read the report"
                          value={linkFallbackText}
                          onChange={(e) => setLinkFallbackText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              applyInsertLink();
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" onClick={applyInsertLink}>
                        Insert at cursor
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setLinkPanelOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                <Textarea
                  className={`mt-1.5 font-mono text-sm leading-relaxed ${errors.content ? "ring-2 ring-red-500/40" : ""}`}
                  rows={20}
                  placeholder={
                    "# My Post Title\n\nIntro paragraph with an [inline link](https://example.com).\n\n## Section\n\n- Bullet with [a link](https://example.org)"
                  }
                  aria-invalid={errors.content ? "true" : "false"}
                  {...contentFieldReg}
                  ref={(el) => {
                    contentFieldRef(el);
                    contentTextareaRef.current = el;
                  }}
                />
                <FieldError message={errors.content?.message} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary-container">search</span>
              <span className="text-sm font-semibold text-on-surface">Search engine optimization</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-on-surface">Meta title</label>
                <Input
                  className={`mt-1.5 ${errors.meta_title ? "ring-2 ring-red-500/40" : ""}`}
                  placeholder="Page title shown in search results"
                  {...register("meta_title")}
                />
                <FieldError message={errors.meta_title?.message} />
                <LengthIndicator current={watch("meta_title")?.length ?? 0} min={30} max={60} label="meta title" />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface">Meta description</label>
                <Textarea
                  className={`mt-1.5 ${errors.meta_description ? "ring-2 ring-red-500/40" : ""}`}
                  rows={3}
                  placeholder="Brief summary shown in search results (120–160 chars)"
                  {...register("meta_description")}
                />
                <FieldError message={errors.meta_description?.message} />
                <LengthIndicator current={watch("meta_description")?.length ?? 0} min={120} max={160} label="meta desc" />
              </div>
              <div className="rounded-lg border border-primary/10 bg-surface-container-low/50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Search preview</p>
                <div className="text-base font-medium text-blue-700 truncate">
                  {watch("meta_title") || watch("title") || "Page title"}
                </div>
                <div className="text-xs text-emerald-800 truncate">
                  intelligencetech.com/blog/{watch("slug") || "your-slug"}
                </div>
                <div className="mt-1 text-sm text-on-surface-variant line-clamp-2">
                  {watch("meta_description") || "Add a meta description to preview how this post will appear in search results."}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary-container">tune</span>
              <span className="text-sm font-semibold text-on-surface">Publishing details</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-on-surface">Category</label>
                <Input className="mt-1.5" placeholder="Updates" {...register("category")} />
                <FieldError message={errors.category?.message} />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface">Tags (comma-separated)</label>
                <Input
                  className={`mt-1.5 ${errors.tags ? "ring-2 ring-red-500/40" : ""}`}
                  placeholder="ai, saas, product"
                  value={watch("tags").join(", ")}
                  onChange={(e) =>
                    setValue(
                      "tags",
                      e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      { shouldValidate: true, shouldDirty: true },
                    )
                  }
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-on-surface">Featured image</label>
              <Input
                className={`mt-1.5 ${errors.featured_image ? "ring-2 ring-red-500/40" : ""}`}
                placeholder="https://..."
                {...register("featured_image")}
              />
              <FieldError message={errors.featured_image?.message} />
              <div className="mt-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-primary/10 px-3 py-2 text-xs font-medium text-on-surface-variant transition hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  Upload image
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void uploadFeaturedImage(f);
                    }}
                    disabled={uploading}
                  />
                </label>
                {uploading && <span className="ml-2 text-xs text-on-surface-variant">Uploading…</span>}
              </div>
              {watch("featured_image")?.trim() ? (
                <div className="mt-3 overflow-hidden rounded-lg border border-primary/8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={watch("featured_image")} alt="Featured" className="h-32 w-full object-cover" />
                </div>
              ) : null}
            </div>
          </Card>
        </SlideInLeft>

        {showPreview && (
          <SlideInRight className="space-y-5 xl:col-span-2">
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary-container">visibility</span>
                <span className="text-sm font-semibold text-on-surface">Live preview</span>
              </div>
              <BlogMarkdownPreview content={watch("content") ?? ""} />
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary-container">checklist</span>
                <span className="text-sm font-semibold text-on-surface">SEO checklist</span>
              </div>
              <SeoChecklist checks={checks} />
            </Card>
          </SlideInRight>
        )}
      </div>
    </FadeUp>
  );
}
