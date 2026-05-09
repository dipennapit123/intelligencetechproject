"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { findActiveChildHref } from "@/lib/nav-active";

type NavChild = { label: string; href: string; icon?: string };

type NavEntry = {
  id: string;
  label: string;
  href: string;
  icon: string;
  children: NavChild[];
};

const NAV: NavEntry[] = [
  {
    id: "overview",
    label: "Dashboard",
    href: "/app",
    icon: "space_dashboard",
    children: [{ label: "Home", href: "/app" }],
  },
  {
    id: "blog",
    label: "Blog",
    href: "/app/blog",
    icon: "article",
    children: [
      { label: "All posts", href: "/app/blog", icon: "list" },
      { label: "New post", href: "/app/blog/new", icon: "add_circle" },
    ],
  },
  {
    id: "products",
    label: "Products",
    href: "/app/products",
    icon: "inventory_2",
    children: [
      { label: "All products", href: "/app/products", icon: "list" },
      { label: "New product", href: "/app/products/new", icon: "add_circle" },
    ],
  },
  {
    id: "content",
    label: "Site Content",
    href: "/app/content",
    icon: "edit_note",
    children: [
      { label: "All sections", href: "/app/content", icon: "grid_view" },
      { label: "Hero", href: "/app/content/hero", icon: "view_carousel" },
      { label: "About", href: "/app/content/about", icon: "info" },
      { label: "Navigation", href: "/app/content/nav_links", icon: "menu" },
      { label: "Footer", href: "/app/content/footer", icon: "call_to_action" },
      { label: "Contact", href: "/app/content/contact_info", icon: "contact_mail" },
      { label: "Privacy", href: "/app/content/privacy_policy", icon: "policy" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname() || "/app";

  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => ({
    overview: pathname === "/app",
    blog: pathname.startsWith("/app/blog"),
    products: pathname.startsWith("/app/products"),
    content: pathname.startsWith("/app/content"),
  }));

  React.useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const entry of NAV) {
        const isActive =
          entry.id === "overview"
            ? pathname === "/app"
            : pathname.startsWith(entry.href);
        if (isActive) next[entry.id] = true;
      }
      return next;
    });
  }, [pathname]);

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-primary/8 bg-white shadow-[2px_0_16px_rgba(20,33,61,0.04)]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-primary/8 px-5">
        <Link href="/app" className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary">
            <span className="material-symbols-outlined text-[20px]">hub</span>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold tracking-tight text-primary">Intelligence Tech</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">Admin</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="space-y-0.5">
          {NAV.map((entry) => {
            const activeChildHref = findActiveChildHref(pathname, entry.children);
            const isOpen = openGroups[entry.id] ?? false;
            const parentActive = activeChildHref !== null;

            return (
              <li key={entry.id}>
                <div className="flex items-center gap-0.5">
                  <Link
                    href={entry.href}
                    className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      parentActive
                        ? "font-semibold text-primary"
                        : "font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                    }`}
                  >
                    <span className={`material-symbols-outlined shrink-0 text-[20px] ${parentActive ? "text-primary-container" : ""}`}>
                      {entry.icon}
                    </span>
                    <span className="truncate">{entry.label}</span>
                  </Link>
                  {entry.children.length > 1 && (
                    <button
                      type="button"
                      onClick={() => toggleGroup(entry.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
                      aria-expanded={isOpen}
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] transition-transform ${isOpen ? "rotate-180" : ""}`}
                      >
                        expand_more
                      </span>
                    </button>
                  )}
                </div>

                {isOpen && entry.children.length > 1 && (
                  <ul className="ml-5 mt-0.5 space-y-0.5 border-l-2 border-primary/8 pb-1 pl-3">
                    {entry.children.map((child) => {
                      const subActive = activeChildHref === child.href;
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors ${
                              subActive
                                ? "bg-primary-container/12 font-semibold text-primary"
                                : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                            }`}
                          >
                            {child.icon && (
                              <span className={`material-symbols-outlined text-[16px] ${subActive ? "text-primary-container" : "text-on-surface-variant/60"}`}>
                                {child.icon}
                              </span>
                            )}
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-primary/8 px-3 py-3">
        <a
          href="mailto:support@intelligencetech.com"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
        >
          <span className="material-symbols-outlined text-[18px]">help</span>
          Help & Support
        </a>
      </div>
    </aside>
  );
}
