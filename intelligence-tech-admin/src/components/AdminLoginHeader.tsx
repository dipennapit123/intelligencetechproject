function publicSiteBase() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

/** Slim top bar for /login — matches main site header chrome without dashboard links. */
export function AdminLoginHeader() {
  const site = publicSiteBase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/8 bg-white shadow-[0_1px_3px_rgba(20,33,61,0.06)]">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="flex flex-col leading-[1.1] tracking-[-0.03em] text-primary shrink-0"
            style={{ fontFamily: '"Saira Stencil", ui-sans-serif, system-ui, sans-serif' }}
          >
            <span className="text-[17px]">Intelligence</span>
            <span className="text-[17px]">Tech</span>
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-medium uppercase tracking-widest shrink-0">
            Admin
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <a
            href={site}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:text-primary-container transition-colors"
          >
            View live site
          </a>
          <a
            href={site}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-linear-to-br from-primary to-primary-container px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all sm:px-6 sm:text-sm"
          >
            Open site
          </a>
        </div>
      </div>
    </header>
  );
}
