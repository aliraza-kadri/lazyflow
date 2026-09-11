import AdminTopbar from "@/components/admin/topbar";
import { StatCard, Panel, BarChart } from "@/components/admin/stat-card";
import StatusBadge from "@/components/admin/status-badge";
import {
  mockDashboardStats,
  mockLeads,
  mockLeadsByWeek,
  mockLeadsByIndustry,
} from "@/lib/mock-data";
import Link from "next/link";

export default function AdminDashboardPage() {
  const recentLeads = [...mockLeads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <>
      <AdminTopbar title="Dashboard" description="Overview of leads and activity" />

      <div className="flex-1 space-y-6 p-5 md:p-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Leads" value={mockDashboardStats.totalLeads} hint="All time" accent />
          <StatCard label="New Leads" value={mockDashboardStats.newLeads} hint="Awaiting first contact" />
          <StatCard label="Qualified Leads" value={mockDashboardStats.qualifiedLeads} hint="Ready to proceed" />
          <StatCard label="Won Leads" value={mockDashboardStats.wonLeads} hint="Closed successfully" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Panel title="Leads received (last 6 weeks)">
              <BarChart data={mockLeadsByWeek} />
            </Panel>
          </div>
          <div className="lg:col-span-2">
            <Panel title="Leads by industry">
              <div className="flex flex-col gap-3">
                {mockLeadsByIndustry.map((i) => (
                  <div key={i.label} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-xs font-medium text-lf-muted">{i.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-lf-surface">
                      <div
                        className="h-full lf-gradient-bg rounded-full"
                        style={{ width: `${(i.value / Math.max(...mockLeadsByIndustry.map((x) => x.value))) * 100}%` }}
                      />
                    </div>
                    <span className="w-4 text-right text-xs font-semibold text-lf-ink">{i.value}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        <Panel
          title="Recent leads"
          action={
            <Link href="/admin/leads" className="text-xs font-semibold text-lf-accent hover:underline">
              View all →
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-lf-border text-xs uppercase tracking-wide text-lf-muted">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Business</th>
                  <th className="pb-3 font-medium">Industry</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-lf-border/60 last:border-0">
                    <td className="py-3.5 pr-4">
                      <Link href={`/admin/leads/${lead.id}`} className="font-medium text-lf-ink hover:text-lf-accent">
                        {lead.name}
                      </Link>
                    </td>
                    <td className="py-3.5 pr-4 text-lf-muted">{lead.business}</td>
                    <td className="py-3.5 pr-4 text-lf-muted">{lead.industry}</td>
                    <td className="py-3.5 pr-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="py-3.5 pr-4 text-lf-muted">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
