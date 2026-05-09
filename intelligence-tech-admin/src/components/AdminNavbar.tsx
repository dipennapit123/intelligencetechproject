"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminNavbar() {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function signOut() {
    setSigningOut(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
      setMenuOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-primary/6 bg-white/95 backdrop-blur-sm">
      <div className="flex h-14 items-center gap-4 px-4 md:gap-6 md:px-8">
        {/* Search */}
        <div className="mx-auto flex min-w-0 max-w-lg flex-1 items-center gap-2 rounded-lg border border-primary/8 bg-surface-container-low/60 px-3 py-1.5">
          <span className="material-symbols-outlined text-on-surface-variant/50 text-[18px]">search</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts, products, content…"
            className="min-w-0 flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50"
            aria-label="Search"
          />
          <kbd className="hidden rounded border border-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-on-surface-variant/50 sm:block">⌘K</kbd>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>

          <div className="relative ml-1" ref={wrapRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary transition hover:brightness-110"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-xl border border-primary/8 bg-white py-1 shadow-lg"
              >
                <Link
                  role="menuitem"
                  href="/app/profile"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-on-surface transition hover:bg-surface-container-low"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                  Profile
                </Link>
                <div className="mx-3 border-t border-primary/6" />
                <button
                  type="button"
                  role="menuitem"
                  disabled={signingOut}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-low disabled:opacity-50"
                  onClick={() => void signOut()}
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  {signingOut ? "Signing out…" : "Log out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
