"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminTopbar from "@/components/admin/topbar";
import StatusBadge, { leadStatuses } from "@/components/admin/status-badge";
import { TextInput, TextArea, Field } from "@/components/ui/form-field";
import Button from "@/components/ui/button";
import type { Lead, LeadStatus } from "@/lib/types";

export default function AdminLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setLead(data);
          setNotes(data.notes || "");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <AdminTopbar title="Loading Lead..." />
        <div className="flex-1 p-8 text-sm text-lf-muted">Loading lead details...</div>
      </>
    );
  }

  if (!lead) {
    return (
      <>
        <AdminTopbar title="Lead not found" />
        <div className="flex-1 p-8">
          <p className="text-sm text-lf-muted">
            This lead doesn&apos;t exist.{" "}
            <Link href="/admin/leads" className="font-semibold text-lf-accent">
              Back to leads
            </Link>
          </p>
        </div>
      </>
    );
  }

  function updateField<K extends keyof Lead>(key: K, value: Lead[K]) {
    setLead((l) => (l ? { ...l, [key]: value } : l));
  }

  async function handleSaveDetails() {
    if (!lead) return;
    setSaving(true);
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, notes }),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      setLead(updated);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleStatusChange(newStatus: LeadStatus) {
    if (!lead) return;
    updateField("status", newStatus);
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/leads");
    }
  }

  return (
    <>
      <AdminTopbar title={lead.name} description={lead.business} />

      <div className="flex-1 space-y-6 p-5 md:p-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/admin/leads")}
            className="flex items-center gap-1.5 text-sm font-medium text-lf-muted hover:text-lf-ink"
          >
            ← Back to all leads
          </button>
          <Button variant="ghost" size="md" className="text-lf-accent-2 hover:bg-lf-nav" onClick={handleDelete}>
            Delete Lead
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-lf-border bg-lf-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-lf-ink">Lead Details</h2>
                  <p className="text-xs text-lf-muted">
                    Received {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <Button variant="secondary" size="md" onClick={() => setEditing((v) => !v)}>
                  {editing ? "Cancel" : "Edit"}
                </Button>
              </div>

              {editing ? (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <TextInput value={lead.name} onChange={(e) => updateField("name", e.target.value)} />
                  </Field>
                  <Field label="Business">
                    <TextInput value={lead.business} onChange={(e) => updateField("business", e.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <TextInput value={lead.phone} onChange={(e) => updateField("phone", e.target.value)} />
                  </Field>
                  <Field label="Email">
                    <TextInput value={lead.email} onChange={(e) => updateField("email", e.target.value)} />
                  </Field>
                  <Field label="Industry">
                    <TextInput value={lead.industry} onChange={(e) => updateField("industry", e.target.value)} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Problem">
                      <TextArea value={lead.problem} onChange={(e) => updateField("problem", e.target.value)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Time-consuming process">
                      <TextArea value={lead.process} onChange={(e) => updateField("process", e.target.value)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <Button size="md" onClick={handleSaveDetails}>
                      {saving ? "Saving..." : "Save Details"}
                    </Button>
                    {saved && <span className="text-xs font-medium text-lf-accent-2">Saved ✓</span>}
                  </div>
                </div>
              ) : (
                <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-lf-muted">Phone</dt>
                    <dd className="mt-1 text-sm font-medium text-lf-ink">{lead.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-lf-muted">Email</dt>
                    <dd className="mt-1 text-sm font-medium text-lf-ink">{lead.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-lf-muted">Industry</dt>
                    <dd className="mt-1 text-sm font-medium text-lf-ink">{lead.industry}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-lf-muted">Status</dt>
                    <dd className="mt-1">
                      <StatusBadge status={lead.status} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-lf-muted">Lead Source</dt>
                    <dd className="mt-1 text-sm font-medium text-lf-ink">{lead.source || "Website"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-lf-muted">Problem Facing</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-lf-ink break-words break-all whitespace-pre-wrap">{lead.problem || "—"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-lf-muted">
                      Time-Consuming Process
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-lf-ink break-words break-all whitespace-pre-wrap">{lead.process || "—"}</dd>
                  </div>
                </dl>
              )}
            </div>

            <div className="rounded-2xl border border-lf-border bg-lf-card p-6">
              <h2 className="text-lg font-semibold text-lf-ink">Internal Notes</h2>
              <p className="text-xs text-lf-muted">Only visible inside the admin panel.</p>
              <TextArea
                className="mt-4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this lead..."
              />
              <div className="mt-4 flex items-center gap-3">
                <Button size="md" onClick={handleSaveDetails}>
                  {saving ? "Saving..." : "Save Notes"}
                </Button>
                {saved && <span className="text-xs font-medium text-lf-accent-2">Saved ✓</span>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-lf-border bg-lf-card p-6">
              <h2 className="text-sm font-semibold text-lf-ink">Status</h2>
              <p className="mt-1 text-xs text-lf-muted">Update where this lead is in your pipeline.</p>
              <div className="mt-4 flex flex-col gap-2">
                {leadStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s as LeadStatus)}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all ${
                      lead.status === s
                        ? "border-lf-accent bg-lf-accent-soft text-lf-ink"
                        : "border-lf-border text-lf-muted hover:border-lf-ink/20"
                    }`}
                  >
                    {s}
                    {lead.status === s && <span className="text-lf-accent">●</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-lf-border bg-lf-card p-6">
              <h2 className="text-sm font-semibold text-lf-ink">Quick Actions</h2>
              <div className="mt-4 flex flex-col gap-2.5">
                <a
                  href={`https://wa.me/${lead.phone.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-lf-border px-3.5 py-2.5 text-center text-sm font-medium text-lf-ink hover:border-lf-accent/40"
                >
                  Message on WhatsApp
                </a>
                <a
                  href={`mailto:${lead.email}`}
                  className="rounded-xl border border-lf-border px-3.5 py-2.5 text-center text-sm font-medium text-lf-ink hover:border-lf-accent/40"
                >
                  Send Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
