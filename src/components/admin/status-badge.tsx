import type { LeadStatus } from "@/lib/types";

const styles: Record<LeadStatus, string> = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-lf-nav text-lf-accent-2 border-lf-accent-2/40",
  Qualified: "bg-purple-50 text-purple-700 border-purple-200",
  Proposal: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Won: "bg-lf-nav text-lf-accent border-lf-accent/40",
  Lost: "bg-lf-surface text-lf-muted border-lf-border",
};

export const leadStatuses: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];

export default function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {status}
    </span>
  );
}
