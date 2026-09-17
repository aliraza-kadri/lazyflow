"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/topbar";
import { Panel } from "@/components/admin/stat-card";
import { Field, TextInput, TextArea } from "@/components/ui/form-field";
import Button from "@/components/ui/button";
import { mockWebsiteContent } from "@/lib/mock-data";
import { WHATSAPP_NUMBER_STORAGE_KEY } from "@/lib/whatsapp";

export default function AdminContentPage() {
  const [content, setContent] = useState(mockWebsiteContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setContent((prev) => ({ ...prev, ...data }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof typeof content>(key: K, value: (typeof content)[K]) {
    setContent((c) => ({ ...c, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setWarningMsg(null);
    const whatsappNumber = content.contactWhatsapp.replace(/\D/g, "");

    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });

    // Also update settings API to sync contact details & social links across header/footer
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        whatsappNumber,
        email: content.contactEmail,
        instagram: content.instagramUrl,
        linkedin: content.linkedinUrl,
      }),
    });

    setSaving(false);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.warning) {
        setWarningMsg(data.warning);
      }
      window.localStorage.setItem(WHATSAPP_NUMBER_STORAGE_KEY, whatsappNumber);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading) {
    return (
      <>
        <AdminTopbar title="Website Content" description="Edit copy shown across the public site" />
        <div className="p-8 text-sm text-lf-muted">Loading content...</div>
      </>
    );
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

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Button onClick={handleSave}>{saving ? "Saving..." : "Save Changes"}</Button>
            {saved && !warningMsg && <span className="text-sm font-medium text-emerald-500">Saved to MongoDB ✓</span>}
          </div>
          {warningMsg && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-500">
              ⚠️ {warningMsg}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
