type Row = {
  event: string;
  origin: string;
  status: "COMPLETED" | "PENDING" | "BLOCKED" | "INVESTIGATING";
  time: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};

const STATUS_STYLES: Record<Row["status"], string> = {
  COMPLETED: "bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/30",
  PENDING: "bg-amber-500/15 text-amber-900 ring-1 ring-amber-500/30",
  BLOCKED: "bg-red-500/15 text-red-800 ring-1 ring-red-500/30",
  INVESTIGATING: "bg-sky-500/15 text-sky-900 ring-1 ring-sky-500/30",
};

const SEVERITY_STYLES: Record<Row["severity"], string> = {
  LOW: "text-on-surface-variant",
  MEDIUM: "text-amber-800",
  HIGH: "text-orange-700",
  CRITICAL: "text-red-700 font-semibold",
};

export function CmsActivityTable({ rows }: { rows: Row[] }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-primary/8 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-primary/8 px-6 py-4">
        <h3 className="text-lg font-normal tracking-tight text-on-surface">CMS &amp; API activity</h3>
        <span className="text-xs font-medium text-primary-container hover:underline cursor-default">
          View full audit trail
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-primary/8 bg-surface-container-low/80 text-on-surface-variant">
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[11px]">Event</th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[11px]">Origin</th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[11px]">Status</th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[11px]">Timestamp</th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[11px]">Severity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-primary/8 last:border-0 hover:bg-surface-container-low/50">
                <td className="px-6 py-3.5 font-medium text-on-surface">{row.event}</td>
                <td className="px-6 py-3.5 text-on-surface-variant font-mono text-xs">{row.origin}</td>
                <td className="px-6 py-3.5">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[row.status]}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-on-surface-variant tabular-nums">{row.time}</td>
                <td className={`px-6 py-3.5 text-xs uppercase tracking-wide ${SEVERITY_STYLES[row.severity]}`}>
                  {row.severity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
