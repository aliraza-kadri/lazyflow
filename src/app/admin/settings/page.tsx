"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/topbar";
import { Panel } from "@/components/admin/stat-card";
import { Field, TextInput, TextArea } from "@/components/ui/form-field";
import Button from "@/components/ui/button";
import { mockSettings } from "@/lib/mock-data";
import { WHATSAPP_NUMBER_STORAGE_KEY } from "@/lib/whatsapp";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(mockSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  // Change Password state
  const [currPassword, setCurrPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setWarningMsg(null);
    const whatsappNumber = settings.whatsappNumber.replace(/\D/g, "");
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, whatsappNumber }),
    });

    // Also sync with content API for contact email & whatsapp
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactWhatsapp: whatsappNumber,
        contactEmail: settings.email,
        instagramUrl: settings.instagram,
        linkedinUrl: settings.linkedin,
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

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    setChangingPw(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currPassword, newPassword: nextPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwMsg({ type: "error", text: data.error || "Failed to change password." });
      } else {
        setPwMsg({ type: "success", text: "Password changed successfully!" });
        setCurrPassword("");
        setNextPassword("");
      }
    } catch {
      setPwMsg({ type: "error", text: "Network error." });
    } finally {
      setChangingPw(false);
    }
  }

  if (loading) {
    return (
      <>
        <AdminTopbar title="Settings" description="Core contact details and website metadata" />
        <div className="p-8 text-sm text-lf-muted">Loading settings...</div>
      </>
    );
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

        <Panel title="WhatsApp & Automation Webhook Integration">
          <div className="space-y-3">
            <p className="text-xs text-lf-muted leading-relaxed">
              If you use Meta WhatsApp Cloud API, Twilio, Gupshup, Wati, AiSensy, or n8n / Zapier workflows, you can automatically stream every incoming WhatsApp message into the LazyFlow Admin Leads section using this webhook:
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-lf-border bg-lf-surface p-2.5 font-mono text-xs text-lf-ink">
              <span className="flex-1 truncate">/api/leads/webhook</span>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/api/leads/webhook`;
                  navigator.clipboard.writeText(url);
                  alert("Webhook URL copied to clipboard:\n" + url);
                }}
                className="shrink-0 rounded-lg bg-lf-accent/10 px-3 py-1 text-xs font-semibold text-lf-accent hover:bg-lf-accent/20 transition-colors"
              >
                Copy Full URL
              </button>
            </div>
            <p className="text-[11px] text-lf-muted">
              Accepts standard Meta WhatsApp webhook challenges (GET) and JSON payloads with <code className="text-lf-ink font-semibold">name</code>, <code className="text-lf-ink font-semibold">phone</code>, and <code className="text-lf-ink font-semibold">message</code> (POST).
            </p>
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

        {/* Change Admin Password Section */}
        <Panel title="Admin Security & Password">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <p className="text-xs text-lf-muted leading-relaxed">
              Update the master admin password used to sign in to this portal:
            </p>

            {pwMsg && (
              <div
                className={`rounded-xl border p-3 text-xs ${
                  pwMsg.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 font-medium"
                    : "border-red-500/30 bg-red-500/10 text-red-500"
                }`}
              >
                {pwMsg.text}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Current Password">
                <TextInput
                  type="password"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </Field>
              <Field label="New Password" hint="At least 6 characters">
                <TextInput
                  type="password"
                  value={nextPassword}
                  onChange={(e) => setNextPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </Field>
            </div>

            <Button type="submit" disabled={changingPw || !currPassword || !nextPassword}>
              {changingPw ? "Updating Password..." : "Update Admin Password"}
            </Button>
          </form>
        </Panel>
      </div>
    </>
  );
}
