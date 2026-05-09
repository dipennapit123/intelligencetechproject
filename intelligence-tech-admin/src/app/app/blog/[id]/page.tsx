"use client";

import Link from "next/link";
import * as React from "react";

import { BlogEditor, type BlogPayload } from "@/app/app/blog/BlogEditor";
import { apiFetch } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type BlogApi = BlogPayload & { id: string };

export default function EditBlogPage({
  params,
}: {
  params: { id: string };
}) {
  const [blogId, setBlogId] = React.useState<string | null>(null);
  const [initial, setInitial] = React.useState<BlogPayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { id } = params;
        if (!mounted) return;
        setBlogId(id);

        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error("Not authenticated");

        const res = await apiFetch<{ blog: BlogApi }>(`/api/admin/blog/${id}`, token);

        if (!mounted) return;
        const b = res.blog;
        setInitial({
          title: b.title,
          slug: b.slug,
          content: b.content,
          meta_title: b.meta_title,
          meta_description: b.meta_description,
          featured_image: b.featured_image ?? null,
          tags: b.tags ?? [],
          category: b.category ?? null,
          published: b.published,
        });
      } catch (e: unknown) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Request failed");
      }
    })();
    return () => { mounted = false; };
  }, [params]);

  if (error) {
    return <div className="rounded-xl bg-error-container/50 px-4 py-3 text-sm text-on-error-container">{error}</div>;
  }

  if (!blogId || !initial) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
        Loading post…
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/app/blog" className="hover:text-primary transition">Blog</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">Edit post</span>
      </div>
      <BlogEditor mode="edit" blogId={blogId} initial={initial} />
    </div>
  );
}
