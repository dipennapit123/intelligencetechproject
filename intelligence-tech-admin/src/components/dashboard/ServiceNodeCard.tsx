import { Sparkline } from "./Sparkline";

export type ServiceNode = {
  name: string;
  status: "ONLINE" | "DEGRADED" | "MAINT";
  load: string;
  spark: number[];
};

export function ServiceNodeCard({ node }: { node: ServiceNode }) {
  const statusOk = node.status === "ONLINE";
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-primary/8">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-on-surface">{node.name}</span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            statusOk ? "bg-emerald-500/15 text-emerald-800" : "bg-amber-500/15 text-amber-900"
          }`}
        >
          {node.status}
        </span>
      </div>
      <p className="mt-2 text-xs text-on-surface-variant">Load {node.load}</p>
      <div className="mt-3 h-9 w-full">
        <Sparkline values={node.spark} className="h-full w-full" />
      </div>
    </div>
  );
}
