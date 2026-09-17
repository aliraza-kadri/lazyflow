"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/topbar";
import Modal from "@/components/admin/modal";
import Button from "@/components/ui/button";
import { Field, TextInput, TextArea } from "@/components/ui/form-field";
import type { Service } from "@/lib/types";

const emptyService: Omit<Service, "id"> = {
  title: "",
  description: "",
  category: "",
  active: true,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Service, "id">>(emptyService);

  useEffect(() => {
    fetch("/api/services", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
      })
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyService);
    setModalOpen(true);
  }

  function openEdit(service: Service) {
    setEditingId(service.id);
    setForm({ title: service.title, description: service.description, category: service.category, active: service.active });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    if (editingId) {
      const res = await fetch(`/api/services/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setServices((list) => list.map((s) => (s.id === editingId ? updated : s)));
      }
    } else {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const created = await res.json();
        setServices((list) => [created, ...list]);
      }
    }
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this service?")) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) {
      setServices((list) => list.filter((s) => s.id !== id));
    }
  }

  async function toggleActive(id: string) {
    const service = services.find((s) => s.id === id);
    if (!service) return;
    const nextActive = !service.active;
    setServices((list) => list.map((s) => (s.id === id ? { ...s, active: nextActive } : s)));
    await fetch(`/api/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: nextActive }),
    });
  }

  return (
    <>
      <AdminTopbar title="Services" description="Manage the automation services shown on the website" />

      <div className="flex-1 space-y-5 p-5 md:p-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-lf-muted">{services.length} active and inactive services</p>
          <Button onClick={openCreate}>+ Add Service</Button>
        </div>

        {loading ? (
          <p className="text-sm text-lf-muted">Loading services...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div key={s.id} className="flex flex-col rounded-2xl border border-lf-border bg-lf-card p-5">
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-lf-accent-soft px-2.5 py-1 text-[11px] font-semibold text-lf-accent">
                    {s.category || "Uncategorized"}
                  </span>
                  <button
                    onClick={() => toggleActive(s.id)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      s.active ? "bg-lf-nav text-lf-accent" : "bg-lf-surface text-lf-muted"
                    }`}
                  >
                    {s.active ? "Active" : "Inactive"}
                  </button>
                </div>
                <h3 className="mt-3 text-[15px] font-semibold text-lf-ink">{s.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-lf-muted">{s.description}</p>
                <div className="mt-4 flex gap-2 border-t border-lf-border pt-4">
                  <Button variant="secondary" size="md" className="flex-1" onClick={() => openEdit(s)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="md" className="text-lf-accent-2 hover:bg-lf-nav" onClick={() => handleDelete(s.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Service" : "New Service"}>
        <div className="flex flex-col gap-4">
          <Field label="Title">
            <TextInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </Field>
          <Field label="Category">
            <TextInput value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          </Field>
          <Field label="Description">
            <TextArea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium text-lf-ink">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="h-4 w-4 rounded border-lf-border accent-[#087BFF]"
            />
            Active on website
          </label>
          <div className="mt-2 flex gap-3">
            <Button className="flex-1" onClick={handleSave}>
              {editingId ? "Save Changes" : "Create Service"}
            </Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
