"use client";

import { useState } from "react";
import Button from "@/components/ui/button";
import { Field, TextInput, TextArea, Select } from "@/components/ui/form-field";
import { leadStatuses } from "@/components/admin/status-badge";
import type { Lead, LeadStatus } from "@/lib/types";

const industries = [
  "Retail",
  "Garments",
  "Restaurants & Cafes",
  "Salons",
  "Clinics",
  "Real Estate",
  "E-commerce",
  "Service Business",
  "Other",
];

const leadSources = [
  "WhatsApp Direct",
  "WhatsApp Button",
  "WhatsApp Widget",
  "Website Form",
  "Phone Call",
  "Referral",
  "Direct Meeting",
  "WhatsApp Webhook",
  "Other",
];

export default function AddLeadModal({
  isOpen,
  onClose,
  onLeadAdded,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded: (lead: Lead) => void;
}) {
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("Other");
  const [problem, setProblem] = useState("");
  const [process, setProcess] = useState("");
  const [status, setStatus] = useState<LeadStatus>("New");
  const [source, setSource] = useState("WhatsApp Direct");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Please provide at least Name and Phone number.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          business: business.trim(),
          phone: phone.trim(),
          email: email.trim(),
          industry,
          problem: problem.trim(),
          process: process.trim(),
          status,
          source,
          notes: notes.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to add lead");

      const savedLead = await res.json();
      onLeadAdded(savedLead);
      onClose();
    } catch {
      setError("Failed to create lead. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-lf-border bg-lf-card shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-lf-border bg-lf-card/95 px-6 py-4.5 backdrop-blur-md">
          <div>
            <h3 className="text-lg font-bold text-lf-ink">Add New Lead</h3>
            <p className="text-xs text-lf-muted">Manually enter lead details from WhatsApp, calls, or referrals</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-lf-muted hover:bg-lf-surface hover:text-lf-ink transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Contact Name *">
              <TextInput
                placeholder="e.g. Rahul Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>

            <Field label="Phone / WhatsApp *">
              <TextInput
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </Field>

            <Field label="Business Name">
              <TextInput
                placeholder="e.g. Verma Retailers"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
              />
            </Field>

            <Field label="Email Address">
              <TextInput
                type="email"
                placeholder="e.g. rahul@verma.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field label="Industry">
              <Select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Lead Source">
              <Select value={source} onChange={(e) => setSource(e.target.value)}>
                {leadSources.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Initial Pipeline Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>
                {leadStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Problem / Requirement">
            <TextArea
              rows={2}
              placeholder="e.g. Needs automated replies for incoming WhatsApp catalog enquiries"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            />
          </Field>

          <Field label="Current Process (Optional)">
            <TextInput
              placeholder="e.g. Manually typing catalog responses on WhatsApp"
              value={process}
              onChange={(e) => setProcess(e.target.value)}
            />
          </Field>

          <Field label="Internal Notes (Optional)">
            <TextArea
              rows={2}
              placeholder="e.g. Contacted over WhatsApp on Tuesday, interested in inventory sync flow"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-lf-border">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving Lead..." : "Save Lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
