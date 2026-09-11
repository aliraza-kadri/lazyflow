import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent ? "border-transparent lf-gradient-bg text-white" : "border-lf-border bg-lf-card"
      }`}
    >
      <p className={`text-xs font-semibold uppercase tracking-wide ${accent ? "text-white/70" : "text-lf-muted"}`}>
        {label}
      </p>
      <p className={`mt-2.5 text-3xl font-bold tracking-tight ${accent ? "text-white" : "text-lf-ink"}`}>{value}</p>
      {hint && <p className={`mt-1.5 text-xs ${accent ? "text-white/60" : "text-lf-muted"}`}>{hint}</p>}
    </div>
  );
}

export function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-lf-border bg-lf-card p-5 md:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-lf-ink">{title}</h3>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-44 items-end gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-36 w-full items-end overflow-hidden rounded-lg bg-lf-surface">
            <div
              className="w-full lf-gradient-bg rounded-t-lg transition-all"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-medium text-lf-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
