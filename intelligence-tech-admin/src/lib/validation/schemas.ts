import { z } from "zod";

/** ── Login ── */
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** ── Blog ── */
/** Form state uses strings; map to API payload on submit */
export const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(slugRegex, "Use lowercase letters, numbers, and single hyphens only"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  meta_title: z.string().max(80, "Meta title is too long"),
  meta_description: z.string().max(320, "Meta description is too long"),
  featured_image: z.string().refine((s) => {
    const t = s.trim();
    if (t === "") return true;
    try {
      new URL(t);
      return true;
    } catch {
      return false;
    }
  }, "Must be a valid URL or leave empty"),
  tags: z.array(z.string()),
  category: z.string().max(120),
  published: z.boolean(),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;

/** ── Product ── */
export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(slugRegex, "Use lowercase letters, numbers, and single hyphens only"),
  description: z.string().min(1, "Description is required").max(8000),
  category: z.string().min(1, "Category is required").max(120),
  status: z.enum(["active", "beta", "coming_soon"]),
  logo_url: z.string().refine((s) => {
    const t = s.trim();
    if (t === "") return true;
    try {
      new URL(t);
      return true;
    } catch {
      return false;
    }
  }, "Must be a valid URL or leave empty"),
  icon: z.string().min(1, "Icon name is required").max(80),
  featured: z.boolean(),
  featured_order: z.number().int().min(0).max(999),
  page_content: z.record(z.string(), z.unknown()),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

/** ── Site content (per section) ── */
const ctaPair = z.object({
  label: z.string().min(1).max(120),
  href: z.string().min(1).max(500),
});

export const siteHeroSchema = z.object({
  eyebrow: z.string().max(200),
  headlineLine1: z.string().min(1, "Headline line 1 is required").max(200),
  headlineLine2: z.string().min(1, "Headline line 2 is required").max(200),
  body: z.string().min(1, "Body is required").max(4000),
  primaryCta: ctaPair,
  secondaryCta: ctaPair,
  imageUrl: z.union([z.string().url(), z.literal("")]),
  imageAlt: z.string().max(500),
});

export const siteNavSchema = z.object({
  mainLinks: z
    .array(
      z.object({
        label: z.string().min(1, "Link label is required").max(120),
        href: z.string().min(1, "URL is required").max(500),
      }),
    )
    .min(1, "Add at least one navigation link"),
  signInLabel: z.string().min(1).max(80),
  signInHref: z.string().min(1).max(500),
  ctaLabel: z.string().min(1).max(80),
  ctaHref: z.string().min(1).max(500),
});

export const siteAboutSchema = z.object({
  label: z.string().min(1).max(120),
  heading: z.string().min(1).max(300),
  body: z.string().min(1).max(4000),
  pillars: z.array(
    z.object({
      icon: z.string().min(1).max(80),
      title: z.string().min(1).max(200),
      desc: z.string().min(1).max(1000),
    }),
  ),
  stats: z.array(
    z.object({
      value: z.string().min(1).max(40),
      label: z.string().min(1).max(120),
    }),
  ),
});

export const siteFooterSchema = z.object({
  tagline: z.string().min(1).max(500),
  copyright: z.string().min(1).max(200),
  socialLinks: z.array(
    z.object({
      platform: z.string().min(1).max(40),
      url: z.string().url("Each social URL must be valid"),
    }),
  ),
  columns: z.array(
    z.object({
      title: z.string().min(1).max(120),
      links: z.array(
        z.object({
          label: z.string().min(1).max(200),
          href: z.string().min(1).max(500),
        }),
      ),
    }),
  ),
});

export const siteContactSchema = z.object({
  eyebrow: z.string().min(1).max(120),
  heading: z.string().min(1).max(200),
  body: z.string().min(1).max(4000),
  details: z.array(
    z.object({
      icon: z.string().min(1).max(80),
      label: z.string().min(1).max(120),
      value: z.string().min(1).max(500),
    }),
  ),
});

export const sitePrivacySchema = z.object({
  lastUpdated: z.string().min(1).max(120),
  intro: z.string().min(1).max(8000),
  sections: z.array(z.unknown()),
  contactEmail: z.string().email("Valid contact email is required"),
  contactAddress: z.string().min(1).max(500),
});

const siteContentSchemas: Record<string, z.ZodType> = {
  hero: siteHeroSchema,
  nav_links: siteNavSchema,
  about: siteAboutSchema,
  footer: siteFooterSchema,
  contact_info: siteContactSchema,
  privacy_policy: sitePrivacySchema,
};

export function validateSiteContent(key: string, value: unknown): { ok: true; data: unknown } | { ok: false; message: string } {
  const schema = siteContentSchemas[key];
  if (!schema) {
    return { ok: true, data: value };
  }
  const r = schema.safeParse(value);
  if (!r.success) {
    const first = r.error.issues[0];
    return { ok: false, message: first ? `${first.path.join(".")}: ${first.message}` : "Invalid content" };
  }
  return { ok: true, data: r.data };
}

export function parseJsonPayload(text: string): { ok: true; value: unknown } | { ok: false; message: string } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, message: "Invalid JSON — check brackets and quotes." };
  }
}
