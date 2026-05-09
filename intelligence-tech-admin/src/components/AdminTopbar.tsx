"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminTopbar() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function signOut() {
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-it-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/app" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-it-accent text-it-black">
            IT
          </span>
          <span className="text-it-text">Admin</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link className="text-it-text/80 hover:text-it-text" href="/app/blog">
            Blog
          </Link>
        </nav>

        <Button variant="secondary" size="sm" onClick={signOut} disabled={busy}>
          Sign out
        </Button>
      </div>
    </header>
  );
}

