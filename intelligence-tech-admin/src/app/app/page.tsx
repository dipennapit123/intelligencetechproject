"use client";

import Link from "next/link";
import * as React from "react";

import { EcosystemPerformanceChart } from "@/components/dashboard/EcosystemPerformanceChart";
import { FadeUp } from "@/components/motion/AnimatedSection";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
  category: string | null;
  meta_description: string;
};

type ProductRow = { id: string; name: string; slug: string; status: string; featured: boolean };
type ContentEntry = { key: string; updated_at: string };

type DashData = {
  blogs: BlogRow[];
  products: ProductRow[];
  contentEntries: ContentEntry[];
};

const THROUGHPUT_SERIES = [42, 55, 48, 62, 58, 70, 65, 72, 68, 75, 80, 88];

export default function AdminHomePage() {
  const [data, setData] = React.useState<DashData | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: sess } = await supabase.auth.getSession();
        const token = sess.session?.access_token;
        if (!token) return;

        const [blogRes, productRes, contentRes] = await Promise.all([
          apiFetch<{ blogs: BlogRow[] }>("/api/admin/blog", token),
          apiFetch<{ products: ProductRow[] }>("/api/admin/products", token),
          apiFetch<{ entries: ContentEntry[] }>("/api/admin/site-content", token),
        ]);

        setData({
          blogs: blogRes.blogs,
          products: productRes.products,
          contentEntries: contentRes.entries,
        });
      } catch {
        /* non-critical */
      }
    }
    void load();
  }, []);

  const published = data?.blogs.filter((b) => b.published) ?? [];
  const drafts = data?.blogs.filter((b) => !b.published) ?? [];
  const recentBlogs = data?.blogs.slice(0, 5) ?? [];
  const blogsWithSeoIssues = data?.blogs.filter(
    (b) => !b.meta_description || b.meta_description.length < 50,
  ) ?? [];

  return (
    <FadeUp className="space-y-8 pb-10">
      {/* Quick actions */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/app/blog/new"
          className="group flex items-center gap-4 rounded-2xl border border-primary/8 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-primary-container/40"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container/15 text-primary-container transition group-hover:bg-primary-container/25">
            <span className="material-symbols-outlined text-[24px]">edit_note</span>
          </span>
          <div>
            <div className="font-semibold text-on-surface">Create blog post</div>
            <div className="text-xs text-on-surface-variant">Write and publish new content</div>
          </div>
        </Link>
        <Link
          href="/app/products/new"
          className="group flex items-center gap-4 rounded-2xl border border-primary/8 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-primary-container/40"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container/15 text-primary-container transition group-hover:bg-primary-container/25">
            <span className="material-symbols-outlined text-[24px]">add_box</span>
          </span>
          <div>
            <div className="font-semibold text-on-surface">Add product</div>
            <div className="text-xs text-on-surface-variant">Expand the product catalog</div>
          </div>
        </Link>
        <Link
          href="/app/content/hero"
          className="group flex items-center gap-4 rounded-2xl border border-primary/8 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-primary-container/40"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container/15 text-primary-container transition group-hover:bg-primary-container/25">
            <span className="material-symbols-outlined text-[24px]">web</span>
          </span>
          <div>
            <div className="font-semibold text-on-surface">Edit homepage</div>
            <div className="text-xs text-on-surface-variant">Update hero, about, and CTA</div>
          </div>
        </Link>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Published</p>
          <p className="mt-2 text-3xl tabular-nums text-primary">{data ? published.length : "—"}</p>
          <p className="mt-1 text-xs text-emerald-700">Blog posts live</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Drafts</p>
          <p className="mt-2 text-3xl tabular-nums text-primary">{data ? drafts.length : "—"}</p>
          <p className="mt-1 text-xs text-amber-700">{drafts.length > 0 ? "Awaiting publish" : "No drafts"}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Products</p>
          <p className="mt-2 text-3xl tabular-nums text-primary">{data?.products.length ?? "—"}</p>
          <p className="mt-1 text-xs text-emerald-700">In catalog</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Site sections</p>
          <p className="mt-2 text-3xl tabular-nums text-primary">{data?.contentEntries.length ?? "—"}</p>
          <p className="mt-1 text-xs text-on-surface-variant">Configured</p>
        </Card>
      </section>

      {/* Drafts highlight + SEO warnings */}
      {data && (drafts.length > 0 || blogsWithSeoIssues.length > 0) && (
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {drafts.length > 0 && (
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-amber-600">draft</span>
                <span className="font-semibold text-on-surface">Unpublished drafts</span>
                <span className="ml-auto rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-800">{drafts.length}</span>
              </div>
              <ul className="space-y-2.5">
                {drafts.slice(0, 5).map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3">
                    <Link href={`/app/blog/${d.id}`} className="min-w-0 truncate text-sm font-medium text-primary hover:underline">
                      {d.title || "Untitled draft"}
                    </Link>
                    <span className="shrink-0 text-xs text-on-surface-variant">{new Date(d.created_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {blogsWithSeoIssues.length > 0 && (
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-red-500">warning</span>
                <span className="font-semibold text-on-surface">SEO warnings</span>
                <span className="ml-auto rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-bold text-red-800">{blogsWithSeoIssues.length}</span>
              </div>
              <ul className="space-y-2.5">
                {blogsWithSeoIssues.slice(0, 5).map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3">
                    <Link href={`/app/blog/${b.id}`} className="min-w-0 truncate text-sm font-medium text-primary hover:underline">
                      {b.title}
                    </Link>
                    <span className="shrink-0 text-xs text-red-600">Missing meta</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>
      )}

      {/* Recent activity */}
      {data && recentBlogs.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-primary/8 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary-container">history</span>
              <span className="font-semibold text-on-surface">Recent content</span>
            </div>
            <Button href="/app/blog" variant="secondary" size="sm">View all</Button>
          </div>
          <div className="divide-y divide-primary/8">
            {recentBlogs.map((b) => (
              <div key={b.id} className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-surface-container-low/50">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${b.published ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"}`}>
                  <span className="material-symbols-outlined text-[18px]">{b.published ? "check_circle" : "draft"}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={`/app/blog/${b.id}`} className="block truncate text-sm font-medium text-on-surface hover:text-primary">
                    {b.title || "Untitled"}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="font-mono">/blog/{b.slug}</span>
                    <span>·</span>
                    <span>{b.published ? "Published" : "Draft"}</span>
                  </div>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-on-surface-variant">
                  {new Date(b.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <EcosystemPerformanceChart series={THROUGHPUT_SERIES} />
    </FadeUp>
  );
}
