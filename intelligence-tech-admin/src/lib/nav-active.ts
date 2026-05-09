/**
 * Returns which child link is active. Longest href wins. `/app` only matches
 * exactly (not `/app/blog`, `/app/profile`, etc.).
 */
export function findActiveChildHref(pathname: string, children: { href: string }[]): string | null {
  const sorted = [...children].sort((a, b) => b.href.length - a.href.length);
  for (const c of sorted) {
    if (pathname === c.href) return c.href;
    if (pathname.startsWith(`${c.href}/`)) {
      if (c.href === "/app") continue;
      return c.href;
    }
  }
  return null;
}
