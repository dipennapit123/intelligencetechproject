"use client";

import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/Toast";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  featured: boolean;
  featured_order: number;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-800",
  beta: "bg-amber-500/15 text-amber-800",
  coming_soon: "bg-blue-500/15 text-blue-800",
};

export default function ProductListPage() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<ProductRow[]>([]);
  const [busy, setBusy] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");
      const res = await apiFetch<{ products: ProductRow[] }>("/api/admin/products", token);
      setRows(res.products);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");
      await apiFetch(`/api/admin/products/${id}`, token, { method: "DELETE" });
      toast({ variant: "warning", title: "Deleted", message: "Product was deleted." });
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Request failed";
      setError(msg);
      toast({ variant: "error", title: "Delete failed", message: msg });
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Products</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            Manage products displayed on the public site. Featured products appear on the homepage.
          </p>
        </div>
        <Button href="/app/products/new" size="sm">
          <span className="material-symbols-outlined mr-1.5 text-[16px]">add</span>
          New product
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-surface-container-high px-4 py-1.5 text-xs font-semibold text-on-surface">
          {rows.length} total
        </span>
        <span className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-800">
          {rows.filter((p) => p.status === "active").length} active
        </span>
        <span className="rounded-full bg-primary-container/15 px-4 py-1.5 text-xs font-semibold text-primary">
          {rows.filter((p) => p.featured).length} featured
        </span>
      </div>

      {error && <div className="mt-4 rounded-xl bg-error-container/50 px-4 py-2.5 text-sm text-on-error-container">{error}</div>}

      <div className="mt-6 space-y-3">
        {busy ? (
          <Card className="p-6 text-sm text-on-surface-variant">Loading…</Card>
        ) : rows.length === 0 ? (
          <Card className="p-8 text-center">
            <span className="material-symbols-outlined mb-2 text-[32px] text-on-surface-variant/40">inventory_2</span>
            <div className="text-sm text-on-surface-variant">No products yet.</div>
            <Button href="/app/products/new" size="sm" className="mt-4">Create your first product</Button>
          </Card>
        ) : (
          rows.map((p) => (
            <Card key={p.id} className="group p-5 transition hover:ring-primary/15">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${STATUS_COLORS[p.status] ?? "bg-surface-container-high text-on-surface"}`}>
                      {p.status.replace("_", " ")}
                    </span>
                    <span className="text-on-surface-variant">{p.category}</span>
                    {p.featured && (
                      <span className="flex items-center gap-1 rounded-full bg-primary-container/15 px-2 py-0.5 font-semibold text-primary">
                        <span className="material-symbols-outlined text-[12px]">star</span>
                        #{p.featured_order}
                      </span>
                    )}
                  </div>
                  <Link href={`/app/products/${p.id}`} className="mt-1.5 block truncate text-lg font-semibold tracking-tight text-on-surface hover:text-primary">
                    {p.name}
                  </Link>
                  <div className="mt-1 flex items-center gap-3 text-sm text-on-surface-variant">
                    <span className="font-mono text-xs">/products/{p.slug}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/app/products/${p.id}`} className="inline-flex h-9 items-center justify-center rounded-xl border border-primary/10 px-3 text-sm font-medium text-primary transition hover:bg-primary/5">
                    Edit
                  </Link>
                  <button onClick={() => deleteProduct(p.id)} className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-sm font-medium text-on-surface-variant transition hover:bg-red-500/10 hover:text-red-700">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
