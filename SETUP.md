# Setup

Supabase SQL, seed data, and step-by-step backend instructions now live **inside the main web app**:

**[intelligence-tech-web/supabase/README.md](intelligence-tech-web/supabase/README.md)**

That document explains how the **main frontend API** (`intelligence-tech-web` Next.js `/api/*` routes) is the only layer that talks to Supabase for CMS data, and how the admin dashboard connects through that API.

**Default dev admin:** after Supabase keys are in `intelligence-tech-web/.env.local`, run `npm run seed:admin` in that folder, then sign in to the admin app as **admin@gmail.com** / **admin123** (change in production).
