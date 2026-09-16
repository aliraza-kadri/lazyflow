"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminTopbar from "@/components/admin/topbar";
import StatusBadge, { leadStatuses } from "@/components/admin/status-badge";
import AddLeadModal from "@/components/admin/add-lead-modal";
import Button from "@/components/ui/button";
import type { Lead, LeadStatus } from "@/lib/types";

type SortKey = "date-desc" | "date-asc" | "name-asc";

function SourceBadge({ source }: { source?: string }) {
  const s = source || "Website";
  const isWhatsApp = s.toLowerCase().includes("whatsapp");
  const isForm = s.toLowerCase().includes("form");
  const isCall = s.toLowerCase().includes("call") || s.toLowerCase().includes("meeting");

  let colorClasses = "bg-lf-surface text-lf-muted border-lf-border";
  if (isWhatsApp) {
    colorClasses = "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
  } else if (isForm) {
    colorClasses = "bg-blue-500/10 text-blue-600 border-blue-500/30";
  } else if (isCall) {
    colorClasses = "bg-purple-500/10 text-purple-600 border-purple-500/30";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${colorClasses}`}>
      {isWhatsApp && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      )}
      {s}
    </span>
  );
}

export default function AdminLeadsPage() {
  const [leadsList, setLeadsList] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "All">("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [expandedLeads, setExpandedLeads] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedLeads((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchLeads = () => {
    fetch("/api/leads", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLeadsList(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const allSources = useMemo(() => {
    const set = new Set<string>();
    leadsList.forEach((l) => {
      if (l.source) set.add(l.source);
    });
    return Array.from(set);
  }, [leadsList]);

  const filteredLeads = useMemo(() => {
    let result = leadsList.filter((l) => {
      const matchesQuery =
        query.trim() === "" ||
        [l.name, l.business, l.phone, l.email, l.industry, l.problem].some((f) =>
          (f || "").toLowerCase().includes(query.toLowerCase())
        );
      const matchesStatus = status === "All" || l.status === status;
      const matchesSource =
        sourceFilter === "All" ||
        (sourceFilter === "WhatsApp"
          ? (l.source || "").toLowerCase().includes("whatsapp")
          : l.source === sourceFilter);

      return matchesQuery && matchesStatus && matchesSource;
    });

    result = [...result].sort((a, b) => {
      if (sort === "date-desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "date-asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return (a.name || "").localeCompare(b.name || "");
    });

    return result;
  }, [leadsList, query, status, sourceFilter, sort]);

  const handleExportCSV = () => {
    if (leadsList.length === 0) return;
    const headers = ["ID", "Name", "Business", "Phone", "Email", "Industry", "Problem", "Process", "Status", "Source", "Notes", "Date"];
    const rows = filteredLeads.map((l) => [
      l.id,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.business || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.industry || "").replace(/"/g, '""')}"`,
      `"${(l.problem || "").replace(/"/g, '""')}"`,
      `"${(l.process || "").replace(/"/g, '""')}"`,
      l.status,
      `"${(l.source || "").replace(/"/g, '""')}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      l.createdAt,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lazyflow_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL leads? This action cannot be undone.")) {
      return;
    }
    setIsClearing(true);
    try {
      const res = await fetch("/api/leads", { method: "DELETE" });
      if (res.ok) {
        setLeadsList([]);
      }
    } catch {
      alert("Failed to clear leads.");
    } finally {
      setIsClearing(false);
    }
  };

  const handleLoadSample = async () => {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "load_sample" }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.leads) setLeadsList(data.leads);
    }
  };

  return (
    <>
      <AdminTopbar
        title="Leads"
        description="All live enquiries received from website, WhatsApp and manual inputs"
        action={
          <div className="flex items-center gap-2.5">
            {leadsList.length > 0 && (
              <>
                <Button variant="secondary" size="md" onClick={handleExportCSV}>
                  Export CSV
                </Button>
                <button
                  onClick={handleClearAll}
                  disabled={isClearing}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {isClearing ? "Clearing..." : "Clear All Leads"}
                </button>
              </>
            )}
            <Button size="md" onClick={() => setIsAddModalOpen(true)}>
              + Add Lead
            </Button>
          </div>
        }
      />

      <div className="flex-1 space-y-5 p-5 md:p-8">
        {/* Search & Filter Bar */}
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
              placeholder="Search name, phone, business..."
              className="w-full rounded-xl border border-lf-border bg-lf-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-lf-accent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-xl border border-lf-border bg-lf-card px-3 py-2.5 text-sm outline-none focus:border-lf-accent"
            >
              <option value="All">All Sources</option>
              <option value="WhatsApp">All WhatsApp Leads</option>
              {allSources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus | "All")}
              className="rounded-xl border border-lf-border bg-lf-card px-3 py-2.5 text-sm outline-none focus:border-lf-accent"
            >
              <option value="All">All Statuses</option>
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

        {/* Leads Table */}
        <div className="overflow-hidden rounded-2xl border border-lf-border bg-lf-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-lf-border bg-lf-surface/60 text-xs uppercase tracking-wide text-lf-muted">
                  <th className="px-5 py-3.5 font-medium">Name</th>
                  <th className="px-5 py-3.5 font-medium">Phone / WhatsApp</th>
                  <th className="px-5 py-3.5 font-medium">Business</th>
                  <th className="px-5 py-3.5 font-medium">Source</th>
                  <th className="px-5 py-3.5 font-medium">Requirement / Problem</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium">Date</th>
                  <th className="px-5 py-3.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-lf-border/60 last:border-0 hover:bg-lf-surface/40">
                    <td className="px-5 py-4">
                      <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-lf-ink hover:text-lf-accent">
                        {lead.name}
                      </Link>
                      {lead.email && <div className="text-xs text-lf-muted">{lead.email}</div>}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-lf-ink font-medium">
                      {lead.phone}
                    </td>
                    <td className="px-5 py-4 text-lf-muted">
                      {lead.business || "—"}
                      {lead.industry && (
                        <div className="text-[11px] text-lf-muted/70">{lead.industry}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <SourceBadge source={lead.source} />
                    </td>
                    <td className="max-w-[320px] px-5 py-4 text-xs text-lf-ink/80">
                      <div
                        className={`break-words break-all leading-relaxed ${
                          expandedLeads[lead.id] ? "" : "line-clamp-2"
                        }`}
                        title={lead.problem || ""}
                      >
                        {lead.problem || "—"}
                      </div>
                      {lead.process && expandedLeads[lead.id] && (
                        <div className="mt-1.5 pt-1.5 border-t border-lf-border/50 text-[11px] text-lf-muted break-words break-all">
                          <span className="font-semibold text-lf-ink">Process: </span>
                          {lead.process}
                        </div>
                      )}
                      {(lead.problem?.length || 0) > 35 && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(lead.id)}
                          className="mt-1 text-[11px] font-semibold text-lf-accent hover:underline block"
                        >
                          {expandedLeads[lead.id] ? "Show less ↑" : "Show full text ↓"}
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-lf-muted">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^\d]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                        >
                          Chat
                        </a>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
                {leadsList.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lf-surface border border-lf-border text-lf-muted mb-4">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <h4 className="text-base font-bold text-lf-ink">No Leads Yet</h4>
                      <p className="mt-1.5 max-w-md mx-auto text-xs text-lf-muted leading-relaxed">
                        Your website is brand new! When visitors message on WhatsApp, fill the contact form, or use the floating widget, their enquiries will automatically show up here.
                      </p>
                      <div className="mt-6 flex items-center justify-center gap-3">
                        <Button size="md" onClick={() => setIsAddModalOpen(true)}>
                          + Add First Lead Manually
                        </Button>
                        <Button variant="secondary" size="md" onClick={handleLoadSample}>
                          Load Sample Test Leads
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}

                {leadsList.length > 0 && filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm text-lf-muted">
                      No leads match your search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-lf-muted">
          Showing {filteredLeads.length} of {leadsList.length} leads.
        </p>
      </div>

      {/* Manual Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onLeadAdded={(newLead) => {
          setLeadsList((prev) => [newLead, ...prev]);
        }}
      />
    </>
  );
}
