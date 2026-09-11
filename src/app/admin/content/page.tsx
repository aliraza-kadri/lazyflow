"use client";

import { useState } from "react";
import AdminTopbar from "@/components/admin/topbar";
import { Panel } from "@/components/admin/stat-card";
import { Field, TextInput, TextArea } from "@/components/ui/form-field";
import Button from "@/components/ui/button";
import { mockWebsiteContent } from "@/lib/mock-data";

export default function AdminContentPage() {
  const [content, setContent] = useState(mockWebsiteContent);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof typeof content>(key: K, value: (typeof content)[K]) {
    setContent((c) => ({ ...c, [key]: value }));
  }

  function handleSave() {
    // NOTE: local state only for now — wire this to Supabase / an API route
    // to persist edits and have the public site read from it.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <AdminTopbar title="Website Content" description="Edit the copy shown across the public site" />

      <div className="flex-1 space-y-6 p-5 md:p-8">
        <Panel title="Hero Section">
          <div className="flex flex-col gap-4">
            <Field label="Hero Heading" hint="Line breaks are preserved">
              <TextArea value={content.heroHeading} onChange={(e) => update("heroHeading", e.target.value)} />
            </Field>
            <Field label="Hero Description">
              <TextArea value={content.heroDescription} onChange={(e) => update("heroDescription", e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Primary CTA Text">
                <TextInput value={content.ctaPrimaryText} onChange={(e) => update("ctaPrimaryText", e.target.value)} />
              </Field>
              <Field label="Secondary CTA Text">
                <TextInput value={content.ctaSecondaryText} onChange={(e) => update("ctaSecondaryText", e.target.value)} />
              </Field>
            </div>
          </div>
        </Panel>

        <Panel title="About Section">
          <Field label="About Text">
            <TextArea className="min-h-[140px]" value={content.aboutText} onChange={(e) => update("aboutText", e.target.value)} />
          </Field>
        </Panel>

        <Panel title="Contact Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Contact Email">
              <TextInput value={content.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
            </Field>
            <Field label="WhatsApp Number" hint="Digits only, international format">
              <TextInput value={content.contactWhatsapp} onChange={(e) => update("contactWhatsapp", e.target.value)} />
            </Field>
          </div>
        </Panel>

        <Panel title="Social Links">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Instagram URL">
              <TextInput value={content.instagramUrl} onChange={(e) => update("instagramUrl", e.target.value)} />
            </Field>
            <Field label="LinkedIn URL">
              <TextInput value={content.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} />
            </Field>
          </div>
        </Panel>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>Save Changes</Button>
          {saved && <span className="text-sm font-medium text-lf-accent-2">Saved ✓ (demo only, not persisted)</span>}
        </div>
      </div>
    </>
  );
}
