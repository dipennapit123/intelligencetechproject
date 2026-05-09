# Intelligence Tech — Project Handoff (New Laptop)

This file is the “single source of truth” for setting up, running, and deploying the **Intelligence Tech** system on a new machine.

It covers:
- What exists in the project
- Required environment variables (web + admin)
- Local setup steps (Supabase, seeding, dev servers)
- Production setup (Vercel, domain/DNS, CORS)
- What **NOT** to commit
- A ready-to-copy prompt for Cursor AI

---

## Repo / apps overview

You have **two Next.js apps**:

### 1) `intelligence-tech-web` (main public site + API)
- **Public website**: landing, products, blog, legal, contact
- **API**: Next.js route handlers under `src/app/api/*`
- **Supabase**: used by server routes only (service-role key)
- **Admin writes**: all mutations happen via `/api/admin/*` and require `Authorization: Bearer <supabase_access_token>`
- **Content freshness**: Next cache tags + `revalidateTag()` after admin mutations
- **Contact form**: `POST /api/contact` via Resend
- **Fonts**: Saira Stencil
- **Favicon**: custom favicon (not Vercel icon)

### 2) `intelligence-tech-admin` (admin dashboard)
- Uses **Supabase Auth** only for sign-in (anon key in browser)
- Calls the main site API at `NEXT_PUBLIC_API_BASE_URL`
- Includes editors for:
  - Blogs (markdown editor with “insert external link”, live preview)
  - Products
  - Site content (CMS JSON + structured Privacy Policy editor)
- Has in-app toasts (success/error/warning) for create/update/delete/publish/upload flows

---

## GitHub repos (current)

### Main web repo
- GitHub: `dipennapit123/intelligencetech`
- Folder: `intelligence-tech-web/`

### Admin dashboard repo
- GitHub: `dipennapit123/intelligencetechadminnepal`
- Folder: `intelligence-tech-admin/`

---

## What NOT to commit / push

### Always keep local-only
- Any `.env*` files with secrets, especially:
  - `.env.local`
  - `.env.local.example` (you chose to exclude templates too in admin)

### Internal docs you asked to exclude from GitHub
- `AGENTS.md`
- `CLAUDE.md`
- `README.md`

> In `intelligence-tech-admin`, `.gitignore` was updated to ignore the above files.

---

## Supabase setup (one Supabase project used by both apps)

### Where schema lives
In `intelligence-tech-web/supabase/`:
- `migrations/001_create_tables.sql` (create tables + storage/policies)
- `seed.sql` (optional demo seed)

### How to initialize Supabase
1. Create a Supabase project.
2. In Supabase **SQL Editor**:
   - Run `migrations/001_create_tables.sql`
   - Then optionally run `seed.sql`
3. In Supabase **Settings → API**, copy:
   - Project URL
   - anon key
   - service role key (server only)

---

## Local development setup (new laptop)

### Prereqs
- Node.js (use current LTS)
- npm

### 1) Clone repos
```bash
git clone https://github.com/dipennapit123/intelligencetech.git
git clone https://github.com/dipennapit123/intelligencetechadminnepal.git
```

### 2) Install dependencies
```bash
cd intelligencetech/intelligence-tech-web && npm install
cd ../../intelligencetechadminnepal/intelligence-tech-admin && npm install
```

### 3) Configure env vars

#### `intelligence-tech-web/.env.local` (server + site)
Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INTELTECH_ADMIN_EMAILS` (comma-separated)

Optional/feature-based:
- `RESEND_API_KEY`
- `CONTACT_INBOX_EMAIL`
- `RESEND_FROM_EMAIL`

Local CORS for admin:
- `CORS_ALLOWED_ORIGINS=http://localhost:3001`

Example:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

INTELTECH_ADMIN_EMAILS=admin@gmail.com

# Contact form (optional)
RESEND_API_KEY=YOUR_RESEND_KEY
CONTACT_INBOX_EMAIL=you@gmail.com
RESEND_FROM_EMAIL=you@yourdomain.com

# Allow admin dashboard to call /api/admin/*
CORS_ALLOWED_ORIGINS=http://localhost:3001
```

#### `intelligence-tech-admin/.env.local` (browser)
Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL`

Example:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 4) Create an admin auth user (optional but recommended)
In `intelligence-tech-web` you can create a dev admin user (email allowlist must include the email):
```bash
cd intelligence-tech-web
DEV_ADMIN_PASSWORD='your-strong-password' npm run seed:admin
```
Default email used by the script/docs: `admin@gmail.com`

### 5) Run both apps locally

Terminal A:
```bash
cd intelligence-tech-web
npm run dev
```

Terminal B:
```bash
cd intelligence-tech-admin
npm run dev -- -p 3001
```

---

## Dummy data / seeding (web repo)

In `intelligence-tech-web`:
- Generate JSON from seed sources:
```bash
npm run seed:dummy:generate
```
- Push dummy data to Supabase (idempotent upserts):
```bash
npm run seed:dummy
```

---

## Production (Vercel) setup

### Main site (web) on Vercel
Set env vars in Vercel for **`intelligence-tech-web`**:
- Supabase keys (same as local)
- Resend keys (if using contact)
- **`CORS_ALLOWED_ORIGINS`** should include the admin production domain

Example:
```env
CORS_ALLOWED_ORIGINS=https://intelligencecnepaltechadmindipen.vercel.app
```

### Admin dashboard on Vercel
Set env vars in Vercel for **`intelligence-tech-admin`**:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_BASE_URL=https://inteligencetech.com
```

> Note: For `NEXT_PUBLIC_API_BASE_URL`, avoid a trailing slash.

---

## Domain + DNS (Namecheap → Vercel)

Typical Vercel DNS config:
- A record: `@` → `76.76.21.21`
- CNAME: `www` → `cname.vercel-dns.com`

Redirect behavior:
- Choose **one** primary domain (e.g. root)
- Redirect the other (e.g. `www`) to it (avoid redirect loops)

---

## Known UX/features added

### Web
- Responsive pages (nav/hamburger, hero, products, product detail, blog, privacy, footer)
- Prevent horizontal overflow (`overflow-x-hidden`)
- Blog external links open in new tab (rehype-external-links)
- Products page CTAs:
  - “Visit Site” opens `https://{slug}.inteligencetech.com`
  - “Read More” goes to `/products/{slug}`
- Contact form sends email via Resend + honeypot spam field
- Cache invalidation via Next tags + `revalidateTag()` on admin mutations

### Admin
- Blog editor with live preview + insert link helper
- Site content editor includes structured privacy sections editor
- Toast notifications for:
  - Blog/product create/update/delete
  - Publish/unpublish
  - Upload success/failure
  - Site-content save success/failure
- After saving/creating a product, redirect to `/app/products`

---

## Cursor AI “what to do” prompt (copy/paste on new laptop)

Use this prompt in Cursor chat after cloning:

```text
You are working on the Intelligence Tech project with two apps:

1) intelligence-tech-web (public site + API)
2) intelligence-tech-admin (admin dashboard)

Goals:
- Never commit/push unless I explicitly ask.
- Do not commit/push any .env*, AGENTS.md, CLAUDE.md, or README.md files.
- Keep the admin dashboard calling the main site API via NEXT_PUBLIC_API_BASE_URL.
- Keep CORS in intelligence-tech-web controlled via CORS_ALLOWED_ORIGINS.

First, help me set up locally:
- Verify both apps install and run.
- Confirm env vars required for web and admin.
- Confirm Supabase migration/seed instructions and run steps.

Then help with any feature requests I describe.
```

---

## Quick troubleshooting

- **Admin can’t call web API (CORS error)**:
  - Add admin origin to `CORS_ALLOWED_ORIGINS` in the **web** app (local `.env.local` or Vercel env), then restart/redeploy.
- **Admin auth fails**:
  - Ensure Supabase anon key + URL are correct.
  - Ensure the admin user exists in Supabase Auth and email is in `INTELTECH_ADMIN_EMAILS` (web).
- **Changes not showing on public site**:
  - Admin API routes should call `revalidateTag()`; confirm deployment updated.
- **Favicon shows Vercel icon**:
  - Ensure `/public/favicon.svg` exists (web) and hard refresh / incognito.

