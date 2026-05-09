"use client";

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ProfilePage() {
  const [email, setEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
    }
    void load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Account</h1>
      <p className="mt-2 text-sm text-on-surface-variant">Signed-in user for this CMS.</p>

      <Card className="mt-8 max-w-lg p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Email</div>
        <p className="mt-2 text-on-surface">{email ?? "…"}</p>
        <p className="mt-4 text-sm text-on-surface-variant">
          Password and account security are managed in Supabase Auth. Contact your administrator to reset
          credentials.
        </p>
        <div className="mt-6">
          <Link href="/app" className="text-sm font-medium text-primary hover:text-primary-container">
            ← Back to dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
