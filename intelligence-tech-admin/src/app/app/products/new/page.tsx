"use client";

import Link from "next/link";

import { ProductEditor, ProductPayload } from "../ProductEditor";

const emptyProduct: ProductPayload = {
  name: "",
  slug: "",
  description: "",
  category: "Platform",
  status: "active",
  logo_url: null,
  icon: "apps",
  featured: false,
  featured_order: 0,
  page_content: {},
};

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/app/products" className="hover:text-primary transition">Products</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">New product</span>
      </div>
      <ProductEditor mode="create" initial={emptyProduct} />
    </div>
  );
}
