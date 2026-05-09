"use client";

type SeoCheck = { label: string; pass: boolean; hint: string };

export function computeSeoChecks(opts: {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  content: string;
}): SeoCheck[] {
  const checks: SeoCheck[] = [];

  const mt = opts.metaTitle.trim();
  checks.push({
    label: "Meta title present",
    pass: mt.length > 0,
    hint: mt.length === 0 ? "Add a meta title for search engines" : `${mt.length} chars`,
  });
  checks.push({
    label: "Meta title length",
    pass: mt.length >= 30 && mt.length <= 60,
    hint:
      mt.length < 30
        ? `Too short (${mt.length}/60) — aim for 30–60 chars`
        : mt.length > 60
          ? `Too long (${mt.length}/60) — trim to ≤ 60 chars`
          : `${mt.length}/60 — good length`,
  });

  const md = opts.metaDescription.trim();
  checks.push({
    label: "Meta description present",
    pass: md.length > 0,
    hint: md.length === 0 ? "Add a meta description" : `${md.length} chars`,
  });
  checks.push({
    label: "Meta description length",
    pass: md.length >= 120 && md.length <= 160,
    hint:
      md.length < 120
        ? `Short (${md.length}/160) — aim for 120–160 chars`
        : md.length > 160
          ? `Too long (${md.length}/160) — trim to ≤ 160`
          : `${md.length}/160 — good length`,
  });

  const sl = opts.slug.trim();
  checks.push({
    label: "Clean slug",
    pass: sl.length > 0 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sl),
    hint: sl.length === 0 ? "Add a URL slug" : /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sl) ? `/blog/${sl}` : "Use lowercase + hyphens only",
  });

  const c = opts.content.trim();
  checks.push({
    label: "Content length",
    pass: c.length >= 300,
    hint: c.length < 300 ? `Only ${c.length} chars — aim for 300+` : `${c.length} chars — good`,
  });

  const hasH1 = /^#\s/m.test(c);
  checks.push({
    label: "Has H1 heading",
    pass: hasH1,
    hint: hasH1 ? "Found" : "Add a # heading to the content",
  });

  return checks;
}

export function seoScore(checks: SeoCheck[]): number {
  if (checks.length === 0) return 0;
  return Math.round((checks.filter((c) => c.pass).length / checks.length) * 100);
}

export function SeoScoreRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";

  return (
    <div className="flex items-center gap-3">
      <svg width={68} height={68} className="shrink-0">
        <circle cx={34} cy={34} r={r} fill="none" stroke="#e2e8f0" strokeWidth={5} />
        <circle
          cx={34}
          cy={34}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 34 34)"
        />
        <text x={34} y={38} textAnchor="middle" className="text-sm font-bold" fill={color}>
          {score}
        </text>
      </svg>
      <div>
        <div className="text-sm font-semibold text-on-surface">SEO score</div>
        <div className="text-xs text-on-surface-variant">
          {score >= 80 ? "Looking good" : score >= 50 ? "Needs improvement" : "Missing critical fields"}
        </div>
      </div>
    </div>
  );
}

export function SeoChecklist({ checks }: { checks: SeoCheck[] }) {
  return (
    <ul className="space-y-2">
      {checks.map((c) => (
        <li key={c.label} className="flex items-start gap-2 text-sm">
          <span className={`material-symbols-outlined mt-0.5 text-[16px] ${c.pass ? "text-emerald-600" : "text-amber-600"}`}>
            {c.pass ? "check_circle" : "warning"}
          </span>
          <div className="min-w-0">
            <span className={c.pass ? "text-on-surface" : "text-on-surface font-medium"}>{c.label}</span>
            <span className="ml-1 text-on-surface-variant">— {c.hint}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function LengthIndicator({ current, min, max, label }: { current: number; min: number; max: number; label: string }) {
  const ok = current >= min && current <= max;
  const short = current < min;
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-surface-container-high overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${ok ? "bg-emerald-500" : short ? "bg-amber-500" : "bg-red-500"}`}
          style={{ width: `${Math.min((current / max) * 100, 100)}%` }}
        />
      </div>
      <span className={`text-xs tabular-nums ${ok ? "text-emerald-700" : short ? "text-amber-700" : "text-red-700"}`}>
        {current}/{max}
      </span>
    </div>
  );
}
