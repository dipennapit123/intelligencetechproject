"use client";

import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/Toast";

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  published: boolean;
  tags: string[];
  category: string | null;
  created_at: string;
};

type Filter = "all" | "published" | "draft";

function hasSeoIssue(b: BlogRow) {
  return (
    !b.meta_title ||
    b.meta_title.length < 20 ||
    !b.meta_description ||
    b.meta_description.length < 50 ||
    !b.slug
  );
}

export default function BlogListPage() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<BlogRow[]>([]);
  const [busy, setBusy] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<Filter>("all");

  function getErrorMessage(e: unknown) {
    return e instanceof Error ? e.message : "Request failed";
  }

  const load = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await apiFetch<{ blogs: BlogRow[] }>("/api/admin/blog", token);
      setRows(res.blogs);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  async function togglePublish(id: string, published: boolean) {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");
      await apiFetch(`/api/admin/blog/${id}`, token, { method: "PATCH", body: JSON.stringify({ published }) });
      toast({
        variant: "success",
        title: published ? "Published" : "Unpublished",
        message: published ? "Post is now live on the public site." : "Post moved back to draft.",
      });
      await load();
    } catch (e: unknown) {
      const msg = getErrorMessage(e);
      setError(msg);
      toast({ variant: "error", title: "Update failed", message: msg });
    }
  }

  async function deleteBlog(id: string) {
    if (!confirm("Delete this blog post?")) return;
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");
      await apiFetch(`/api/admin/blog/${id}`, token, { method: "DELETE" });
      toast({ variant: "warning", title: "Deleted", message: "Blog post was deleted." });
      await load();
    } catch (e: unknown) {
      const msg = getErrorMessage(e);
      setError(msg);
      toast({ variant: "error", title: "Delete failed", message: msg });
    }
  }

  const publishedCount = rows.filter((b) => b.published).length;
  const draftCount = rows.filter((b) => !b.published).length;
  const seoWarnCount = rows.filter(hasSeoIssue).length;

  const filtered =
    filter === "published" ? rows.filter((b) => b.published) :
    filter === "draft" ? rows.filter((b) => !b.published) :
    rows;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Blog</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            Manage posts. Published content appears on the public site.
          </p>
        </div>
        <Button href="/app/blog/new" size="sm">
          <span className="material-symbols-outlined mr-1.5 text-[16px]">add</span>
          New post
        </Button>
      </div>

      {/* Stats strip */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${filter === "all" ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}
        >
          All ({rows.length})
        </button>
        <button
          onClick={() => setFilter("published")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${filter === "published" ? "bg-emerald-600 text-white shadow-sm" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}
        >
          Published ({publishedCount})
        </button>
        <button
          onClick={() => setFilter("draft")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${filter === "draft" ? "bg-amber-600 text-white shadow-sm" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}
        >
          Drafts ({draftCount})
        </button>
        {seoWarnCount > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            {seoWarnCount} missing SEO
          </span>
        )}
      </div>

      {error && <div className="mt-4 rounded-xl bg-error-container/50 px-4 py-2.5 text-sm text-on-error-container">{error}</div>}

      <div className="mt-6 space-y-3">
        {busy ? (
          <Card className="p-6 text-sm text-on-surface-variant">Loading…</Card>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <span className="material-symbols-outlined mb-2 text-[32px] text-on-surface-variant/40">article</span>
            <div className="text-sm text-on-surface-variant">
              {filter === "all" ? "No posts yet." : `No ${filter} posts.`}
            </div>
            {filter === "all" && (
              <Button href="/app/blog/new" size="sm" className="mt-4">Create your first post</Button>
            )}
          </Card>
        ) : (
          filtered.map((b) => {
            const seoWarn = hasSeoIssue(b);
            return (
              <Card key={b.id} className="group p-5 transition hover:ring-primary/15">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${b.published ? "bg-emerald-500/15 text-emerald-800" : "bg-amber-500/15 text-amber-800"}`}>
                        {b.published ? "Published" : "Draft"}
                      </span>
                      <span className="text-on-surface-variant">{b.category ?? "Uncategorized"}</span>
                      {seoWarn && (
                        <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-red-700">
                          <span className="material-symbols-outlined text-[12px]">warning</span>
                          SEO
                        </span>
                      )}
                    </div>
                    <Link href={`/app/blog/${b.id}`} className="mt-1.5 block truncate text-lg font-semibold tracking-tight text-on-surface hover:text-primary">
                      {b.title || "Untitled"}
                    </Link>
                    <div className="mt-1 flex items-center gap-3 text-sm text-on-surface-variant">
                      <span className="font-mono text-xs">/blog/{b.slug}</span>
                      <span className="text-xs">{new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => togglePublish(b.id, !b.published)}>
                      {b.published ? "Unpublish" : "Publish"}
                    </Button>
                    <Link href={`/app/blog/${b.id}`} className="inline-flex h-9 items-center justify-center rounded-xl border border-primary/10 px-3 text-sm font-medium text-primary transition hover:bg-primary/5">
                      Edit
                    </Link>
                    <button onClick={() => deleteBlog(b.id)} className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-sm font-medium text-on-surface-variant transition hover:bg-red-500/10 hover:text-red-700">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
