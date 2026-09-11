"use client";

import { useState } from "react";
import AdminTopbar from "@/components/admin/topbar";
import { Panel } from "@/components/admin/stat-card";
import { Field, TextInput, TextArea } from "@/components/ui/form-field";
import Button from "@/components/ui/button";
import { mockSettings } from "@/lib/mock-data";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(mockSettings);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function handleSave() {
    // NOTE: local state only. Once Supabase is connected, persist this to a
    // `settings` table and have src/config/site.ts read from it (or an API route).
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <AdminTopbar title="Settings" description="Core contact details and website metadata" />

      <div className="flex-1 space-y-6 p-5 md:p-8">
        <Panel title="Contact & Communication">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="WhatsApp Number" hint="Digits only, e.g. 919999999999">
              <TextInput value={settings.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} />
            </Field>
            <Field label="Email">
              <TextInput value={settings.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
          </div>
        </Panel>

        <Panel title="Social Links">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Instagram">
              <TextInput value={settings.instagram} onChange={(e) => update("instagram", e.target.value)} />
            </Field>
            <Field label="LinkedIn">
              <TextInput value={settings.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
            </Field>
          </div>
        </Panel>

        <Panel title="Website Metadata">
          <div className="flex flex-col gap-4">
            <Field label="Meta Title">
              <TextInput value={settings.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} />
            </Field>
            <Field label="Meta Description">
              <TextArea value={settings.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} />
            </Field>
          </div>
        </Panel>

        <div className="rounded-xl border border-lf-border bg-lf-surface px-4 py-3 text-xs text-lf-muted">
          These fields mirror <code className="rounded bg-lf-card px-1 py-0.5">src/config/site.ts</code> — once a
          database is connected, this page becomes the single source of truth instead of the code file.
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>Save Changes</Button>
          {saved && <span className="text-sm font-medium text-lf-accent-2">Saved ✓ (demo only, not persisted)</span>}
        </div>
      </div>
    </>
  );
}
