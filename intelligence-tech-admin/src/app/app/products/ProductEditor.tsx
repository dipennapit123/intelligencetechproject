"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import { FadeUp, SlideInLeft, SlideInRight } from "@/components/motion/AnimatedSection";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldError } from "@/components/ui/FieldError";
import { Input, Textarea } from "@/components/ui/Input";
import { apiFetch, apiUpload } from "@/lib/api";
import { productFormSchema, type ProductFormValues } from "@/lib/validation/schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/Toast";

export type ProductPayload = {
  name: string;
  slug: string;
  description: string;
  category: string;
  status: "active" | "beta" | "coming_soon";
  logo_url: string | null;
  icon: string;
  featured: boolean;
  featured_order: number;
  page_content: Record<string, unknown>;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function toFormValues(i: ProductPayload): ProductFormValues {
  return {
    name: i.name,
    slug: i.slug,
    description: i.description,
    category: i.category,
    status: i.status,
    logo_url: i.logo_url ?? "",
    icon: i.icon,
    featured: i.featured,
    featured_order: i.featured_order,
    page_content: i.page_content ?? {},
  };
}

function toApiPayload(v: ProductFormValues): ProductPayload {
  const logo = v.logo_url.trim();
  return {
    name: v.name,
    slug: v.slug,
    description: v.description,
    category: v.category,
    status: v.status,
    logo_url: logo === "" ? null : logo,
    icon: v.icon,
    featured: v.featured,
    featured_order: v.featured_order,
    page_content: v.page_content,
  };
}

export function ProductEditor({
  mode,
  productId,
  initial,
}: {
  mode: "create" | "edit";
  productId?: string;
  initial: ProductPayload;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [jsonMode, setJsonMode] = React.useState(false);
  const [jsonText, setJsonText] = React.useState(JSON.stringify(initial.page_content, null, 2));
  const [jsonError, setJsonError] = React.useState<string | null>(null);
  const [autoSlug, setAutoSlug] = React.useState(mode === "create");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: toFormValues(initial),
    mode: "onBlur",
  });

  React.useEffect(() => {
    reset(toFormValues(initial));
    setJsonText(JSON.stringify(initial.page_content ?? {}, null, 2));
    setJsonError(null);
  }, [initial, reset]);

  function syncPageContentFromJson(text: string) {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      setValue("page_content", parsed, { shouldValidate: true, shouldDirty: true });
      setJsonError(null);
    } catch {
      setJsonError("Invalid JSON — fix syntax before saving.");
    }
  }

  async function onValid(data: ProductFormValues) {
    if (jsonMode && jsonError) {
      setError("Fix JSON errors before saving.");
      return;
    }
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
        await apiFetch<{ id: string }>("/api/admin/products", token, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast({ variant: "success", title: "Product created", message: "Your product was created successfully." });
        router.push("/app/products");
        router.refresh();
      } else {
        if (!productId) throw new Error("Missing productId");
        await apiFetch(`/api/admin/products/${productId}`, token, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSaved(true);
        toast({ variant: "success", title: "Saved", message: "Product changes were saved." });
        router.push("/app/products");
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

  async function uploadLogo(file: File) {
    setUploading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");
      const { url } = await apiUpload(token, file, "product-images");
      setValue("logo_url", url, { shouldValidate: true, shouldDirty: true });
      toast({ variant: "success", title: "Uploaded", message: "Logo uploaded successfully." });
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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/8 bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/12 text-primary-container">
            <span className="material-symbols-outlined text-[22px]">{watch("icon") || "apps"}</span>
          </span>
          <div>
            <div className="font-semibold text-on-surface">{watch("name") || "New Product"}</div>
            <div className="text-xs text-on-surface-variant">/products/{watch("slug") || "slug"}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Controller
            name="featured"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
                <input type="checkbox" checked={field.value} onChange={field.onChange} className="accent-primary-container" />
                Featured
              </label>
            )}
          />
          <Button size="sm" type="button" disabled={busy} onClick={() => void handleSubmit(onValid)()}>
            {busy ? "Saving…" : saved ? "Saved ✓" : "Save"}
          </Button>
        </div>
      </div>

      {error && <div className="rounded-xl bg-error-container/50 px-4 py-2.5 text-sm text-on-error-container">{error}</div>}
      {saved && <div className="rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-800">Saved successfully.</div>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SlideInLeft className="p-6 xl:col-span-2">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-on-surface">Product name</label>
                <Input
                  className={`mt-1.5 ${errors.name ? "ring-2 ring-red-500/40" : ""}`}
                  placeholder="ScaleWise Pro"
                  {...register("name", {
                    onChange: (e) => {
                      if (autoSlug) setValue("slug", slugify(e.target.value), { shouldValidate: true });
                    },
                  })}
                />
                <FieldError message={errors.name?.message} />
              </div>
              <div>
                <label className="text-sm font-semibold text-on-surface">URL slug</label>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="shrink-0 text-sm text-on-surface-variant">/products/</span>
                  <Input
                    className={errors.slug ? "ring-2 ring-red-500/40" : ""}
                    placeholder="scalewise-pro"
                    {...register("slug", { onChange: () => setAutoSlug(false) })}
                  />
                </div>
                <FieldError message={errors.slug?.message} />
              </div>
              <div>
                <label className="text-sm font-semibold text-on-surface">Description</label>
                <Textarea
                  className={`mt-1.5 ${errors.description ? "ring-2 ring-red-500/40" : ""}`}
                  rows={4}
                  placeholder="A brief product description…"
                  {...register("description")}
                />
                <FieldError message={errors.description?.message} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-on-surface">Category</label>
                  <Input className="mt-1.5" placeholder="Platform" {...register("category")} />
                  <FieldError message={errors.category?.message} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-on-surface">Status</label>
                  <select
                    className="mt-1.5 h-11 w-full rounded-xl border border-black/10 bg-background px-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                    {...register("status")}
                  >
                    <option value="active">Active</option>
                    <option value="beta">Beta</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-on-surface">Icon (Material Symbol)</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Input className={errors.icon ? "ring-2 ring-red-500/40" : ""} placeholder="insights" {...register("icon")} />
                    <span className="material-symbols-outlined text-2xl text-on-surface-variant">{watch("icon") || "apps"}</span>
                  </div>
                  <FieldError message={errors.icon?.message} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-on-surface">Featured order</label>
                  <Input className="mt-1.5" type="number" {...register("featured_order", { valueAsNumber: true })} />
                  <FieldError message={errors.featured_order?.message} />
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-primary/8 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface">Page content</span>
                <button
                  type="button"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${jsonMode ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}
                  onClick={() => setJsonMode(!jsonMode)}
                >
                  <span className="material-symbols-outlined text-[14px]">code</span>
                  {jsonMode ? "Hide JSON" : "Edit JSON"}
                </button>
              </div>
              {jsonMode && (
                <div className="mt-3">
                  <Textarea
                    value={jsonText}
                    onChange={(e) => syncPageContentFromJson(e.target.value)}
                    rows={18}
                    className={`font-mono text-xs ${jsonError ? "ring-2 ring-red-500/40" : ""}`}
                  />
                  {jsonError && <FieldError message={jsonError} />}
                  <p className="mt-2 text-xs text-on-surface-variant">
                    Structure: eyebrow, headline, subhead, heroCopy, heroImage, benefits[], deepDive[], testimonial, integrity[], cta
                  </p>
                </div>
              )}
            </div>
          </Card>
        </SlideInLeft>

        <SlideInRight className="space-y-5">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary-container">image</span>
              <span className="text-sm font-semibold text-on-surface">Logo</span>
            </div>
            <Input
              className={errors.logo_url ? "ring-2 ring-red-500/40" : ""}
              placeholder="https://..."
              {...register("logo_url")}
            />
            <FieldError message={errors.logo_url?.message} />
            <div className="mt-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-primary/10 px-3 py-2 text-xs font-medium text-on-surface-variant transition hover:bg-surface-container-low">
                <span className="material-symbols-outlined text-[16px]">upload</span>
                Upload logo
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadLogo(f);
                  }}
                  disabled={uploading}
                />
              </label>
              {uploading && <span className="ml-2 text-xs text-on-surface-variant">Uploading…</span>}
            </div>
            {watch("logo_url")?.trim() ? (
              <div className="mt-3 overflow-hidden rounded-lg border border-primary/8 bg-surface-container-low p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={watch("logo_url")} alt="Logo" className="mx-auto h-20 w-auto object-contain" />
              </div>
            ) : null}
          </Card>
        </SlideInRight>
      </div>
    </FadeUp>
  );
}
