"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AdminTopbar from "@/components/admin/topbar";
import StatusBadge, { leadStatuses } from "@/components/admin/status-badge";
import { mockLeads } from "@/lib/mock-data";
import type { LeadStatus } from "@/lib/types";

type SortKey = "date-desc" | "date-asc" | "name-asc";

export default function AdminLeadsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "All">("All");
  const [sort, setSort] = useState<SortKey>("date-desc");

  const leads = useMemo(() => {
    let result = mockLeads.filter((l) => {
      const matchesQuery =
        query.trim() === "" ||
        [l.name, l.business, l.phone, l.email, l.industry].some((f) =>
          f.toLowerCase().includes(query.toLowerCase())
        );
      const matchesStatus = status === "All" || l.status === status;
      return matchesQuery && matchesStatus;
    });

    result = [...result].sort((a, b) => {
      if (sort === "date-desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "date-asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [query, status, sort]);

  return (
    <>
      <AdminTopbar title="Leads" description="All enquiries received from the website" />

      <div className="flex-1 space-y-5 p-5 md:p-8">
        <div className="flex flex-col gap-3 rounded-2xl border border-lf-border bg-lf-card p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lf-muted"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, business, phone..."
              className="w-full rounded-xl border border-lf-border bg-lf-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-lf-accent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus | "All")}
              className="rounded-xl border border-lf-border bg-lf-card px-3 py-2.5 text-sm outline-none focus:border-lf-accent"
            >
              <option value="All">All statuses</option>
              {leadStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-lf-border bg-lf-card px-3 py-2.5 text-sm outline-none focus:border-lf-accent"
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="name-asc">Name (A–Z)</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-lf-border bg-lf-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-lf-border bg-lf-surface/60 text-xs uppercase tracking-wide text-lf-muted">
                  <th className="px-5 py-3.5 font-medium">Name</th>
                  <th className="px-5 py-3.5 font-medium">Business</th>
                  <th className="px-5 py-3.5 font-medium">Phone</th>
                  <th className="px-5 py-3.5 font-medium">Industry</th>
                  <th className="px-5 py-3.5 font-medium">Problem</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-lf-border/60 last:border-0 hover:bg-lf-surface/40">
                    <td className="px-5 py-4">
                      <Link href={`/admin/leads/${lead.id}`} className="font-medium text-lf-ink hover:text-lf-accent">
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-lf-muted">{lead.business}</td>
                    <td className="px-5 py-4 text-lf-muted">{lead.phone}</td>
                    <td className="px-5 py-4 text-lf-muted">{lead.industry}</td>
                    <td className="max-w-[220px] px-5 py-4 text-lf-muted">
                      <span className="line-clamp-1">{lead.problem}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-lf-muted">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </td>
                  </tr>
                ))}

                {leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-lf-muted">
                      No leads match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-lf-muted">
          Showing {leads.length} of {mockLeads.length} leads (demo data).
        </p>
      </div>
    </>
  );
}
