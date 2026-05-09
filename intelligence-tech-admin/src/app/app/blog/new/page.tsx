"use client";

import Link from "next/link";

import { BlogEditor, type BlogPayload } from "@/app/app/blog/BlogEditor";

export default function NewBlogPage() {
  const initial: BlogPayload = {
    title: "",
    slug: "",
    content: "# Title\n\nWrite your post here.\n",
    meta_title: "",
    meta_description: "",
    featured_image: null,
    tags: [],
    category: "Updates",
    published: false,
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/app/blog" className="hover:text-primary transition">Blog</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">New post</span>
      </div>
      <BlogEditor mode="create" initial={initial} />
    </div>
  );
}
