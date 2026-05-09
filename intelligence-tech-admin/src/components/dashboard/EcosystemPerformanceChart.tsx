"use client";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** Bar chart using existing primary-container — heights are relative (0–100). */
export function EcosystemPerformanceChart({ series }: { series: number[] }) {
  const max = Math.max(...series, 1);
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary/8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-normal tracking-tight text-on-surface">Ecosystem performance</h3>
          <p className="mt-1 text-sm text-on-surface-variant">Content throughput vs. historical average</p>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <span className="flex items-center gap-2 text-on-surface-variant">
            <span className="h-2 w-2 rounded-full bg-primary-container" aria-hidden />
            Throughput
          </span>
          <span className="flex items-center gap-2 text-on-surface-variant">
            <span className="h-2 w-2 rounded-full bg-on-surface-variant/40" aria-hidden />
            Historical avg
          </span>
        </div>
      </div>
      <div className="flex h-[180px] items-end justify-between gap-1 sm:gap-2">
        {series.map((v, i) => {
          const pct = (v / max) * 100;
          const barH = Math.max((pct / 100) * 140, 12);
          return (
            <div key={MONTHS[i]} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div
                className="w-full max-w-[2rem] rounded-t-md bg-primary-container/90"
                style={{ height: barH }}
                title={`${MONTHS[i]}: ${Math.round(v)}`}
              />
              <span className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
                {MONTHS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
