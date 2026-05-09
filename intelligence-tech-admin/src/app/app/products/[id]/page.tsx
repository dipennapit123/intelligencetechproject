"use client";

import Link from "next/link";
import * as React from "react";

import { apiFetch } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ProductEditor, ProductPayload } from "../ProductEditor";

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  logo_url: string | null;
  icon: string;
  featured: boolean;
  featured_order: number;
  page_content: Record<string, unknown>;
};

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [product, setProduct] = React.useState<ApiProduct | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error("Not authenticated");
        const res = await apiFetch<{ product: ApiProduct }>(`/api/admin/products/${resolvedParams.id}`, token);
        setProduct(res.product);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load product");
      }
    }
    void load();
  }, [resolvedParams.id]);

  if (error) {
    return <div className="rounded-xl bg-error-container/50 px-4 py-3 text-sm text-on-error-container">{error}</div>;
  }

  if (!product) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
        Loading product…
      </div>
    );
  }

  const initial: ProductPayload = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    status: product.status as ProductPayload["status"],
    logo_url: product.logo_url,
    icon: product.icon ?? "apps",
    featured: product.featured ?? false,
    featured_order: product.featured_order ?? 0,
    page_content: product.page_content ?? {},
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/app/products" className="hover:text-primary transition">Products</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">{product.name}</span>
      </div>
      <ProductEditor mode="edit" productId={product.id} initial={initial} />
    </div>
  );
}
