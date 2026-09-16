"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/topbar";
import { StatCard, Panel, BarChart } from "@/components/admin/stat-card";
import StatusBadge from "@/components/admin/status-badge";
import AddLeadModal from "@/components/admin/add-lead-modal";
import Button from "@/components/ui/button";
import type { Lead } from "@/lib/types";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLeads(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "New").length;
  const qualifiedLeads = leads.filter((l) => l.status === "Qualified").length;
  const wonLeads = leads.filter((l) => l.status === "Won").length;

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Industry breakdown
  const industryCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const ind = l.industry || "Other";
    industryCounts[ind] = (industryCounts[ind] || 0) + 1;
  });
  const leadsByIndustry = Object.entries(industryCounts).map(([label, value]) => ({ label, value }));
  const maxIndustryValue = Math.max(...leadsByIndustry.map((x) => x.value), 1);

  // Weekly breakdown (last 6 weeks)
  const now = new Date().getTime();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weeklyCounts = [5, 4, 3, 2, 1, 0].map((weeksAgo) => {
    const start = now - (weeksAgo + 1) * weekMs;
    const end = now - weeksAgo * weekMs;
    const count = leads.filter((l) => {
      const t = new Date(l.createdAt).getTime();
      return t >= start && t < end;
    }).length;
    return { label: `Wk ${6 - weeksAgo}`, value: count };
  });

  return (
    <>
      <AdminTopbar
        title="Dashboard"
        description="Live overview of leads and website inquiries"
        action={
          <Button size="md" onClick={() => setIsAddModalOpen(true)}>
            + Add Lead
          </Button>
        }
      />

      <div className="flex-1 space-y-6 p-5 md:p-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Leads" value={loading ? "..." : totalLeads} hint="All time" accent />
          <StatCard label="New Leads" value={loading ? "..." : newLeads} hint="Awaiting first contact" />
          <StatCard label="Qualified Leads" value={loading ? "..." : qualifiedLeads} hint="Ready to proceed" />
          <StatCard label="Won Leads" value={loading ? "..." : wonLeads} hint="Closed successfully" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Panel title="Leads received (last 6 weeks)">
              <BarChart data={weeklyCounts} />
            </Panel>
          </div>
          <div className="lg:col-span-2">
            <Panel title="Leads by industry">
              <div className="flex flex-col gap-3">
                {leadsByIndustry.length === 0 ? (
                  <p className="text-xs text-lf-muted py-4">No lead data yet.</p>
                ) : (
                  leadsByIndustry.map((i) => (
                    <div key={i.label} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-xs font-medium text-lf-muted truncate">{i.label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-lf-surface">
                        <div
                          className="h-full lf-gradient-bg rounded-full"
                          style={{ width: `${(i.value / maxIndustryValue) * 100}%` }}
                        />
                      </div>
                      <span className="w-4 text-right text-xs font-semibold text-lf-ink">{i.value}</span>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        </div>

        <Panel
          title="Recent leads"
          action={
            <Link href="/admin/leads" className="text-xs font-semibold text-lf-accent hover:underline">
              View all leads ({totalLeads}) →
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-lf-border text-xs uppercase tracking-wide text-lf-muted">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Phone / WhatsApp</th>
                  <th className="pb-3 font-medium">Source</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-lf-border/60 last:border-0 hover:bg-lf-surface/40">
                    <td className="py-3.5 pr-4">
                      <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-lf-ink hover:text-lf-accent">
                        {lead.name}
                      </Link>
                      {lead.business && <div className="text-xs text-lf-muted">{lead.business}</div>}
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-xs text-lf-muted">{lead.phone}</td>
                    <td className="py-3.5 pr-4">
                      <span className="inline-flex items-center rounded-full bg-lf-surface border border-lf-border px-2 py-0.5 text-[11px] font-medium text-lf-muted">
                        {lead.source || "Website"}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-lf-muted">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </td>
                  </tr>
                ))}
                {recentLeads.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-lf-muted">
                      No leads received yet. Website visitors chatting on WhatsApp or submitting forms will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onLeadAdded={(newLead) => {
          setLeads((prev) => [newLead, ...prev]);
        }}
      />
    </>
  );
}
