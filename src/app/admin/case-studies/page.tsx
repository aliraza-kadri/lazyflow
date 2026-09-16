"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/topbar";
import Modal from "@/components/admin/modal";
import Button from "@/components/ui/button";
import { Field, TextInput, TextArea } from "@/components/ui/form-field";
import type { CaseStudy } from "@/lib/types";

const emptyForm: Omit<CaseStudy, "id" | "createdAt"> = {
  title: "",
  industry: "",
  summary: "",
  problem: "",
  solution: "",
  result: "",
  published: false,
  isDemo: false,
};

export default function AdminCaseStudiesPage() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetch("/api/case-studies")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(cs: CaseStudy) {
    setEditingId(cs.id);
    setForm({
      title: cs.title,
      industry: cs.industry,
      summary: cs.summary,
      problem: cs.problem,
      solution: cs.solution,
      result: cs.result,
      published: cs.published,
      isDemo: cs.isDemo,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    if (editingId) {
      const res = await fetch(`/api/case-studies/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((list) => list.map((c) => (c.id === editingId ? updated : c)));
      }
    } else {
      const res = await fetch("/api/case-studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const created = await res.json();
        setItems((list) => [created, ...list]);
      }
    }
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this case study?")) return;
    const res = await fetch(`/api/case-studies/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((list) => list.filter((c) => c.id !== id));
    }
  }

  async function togglePublish(id: string) {
    const cs = items.find((c) => c.id === id);
    if (!cs) return;
    const nextPublished = !cs.published;
    setItems((list) => list.map((c) => (c.id === id ? { ...c, published: nextPublished } : c)));
    await fetch(`/api/case-studies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: nextPublished }),
    });
  }

  return (
    <>
      <AdminTopbar title="Case Studies" description="Publish project write-ups and success stories" />

      <div className="flex-1 space-y-5 p-5 md:p-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-lf-muted">{items.length} case studies</p>
          <Button onClick={openCreate}>+ Add Case Study</Button>
        </div>

        {loading ? (
          <p className="text-sm text-lf-muted">Loading case studies...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {items.map((c) => (
              <div key={c.id} className="flex flex-col rounded-2xl border border-lf-border bg-lf-card p-5">
                <div className="flex flex-wrap items-center gap-2">

                  <span className="rounded-full bg-lf-accent-soft px-2.5 py-1 text-[11px] font-semibold text-lf-accent">
                    {c.industry}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      c.published ? "bg-lf-nav text-lf-accent" : "bg-lf-surface text-lf-muted"
                    }`}
                  >
                    {c.published ? "Published" : "Unpublished"}
                  </span>
                </div>
                <h3 className="mt-3 text-[15px] font-semibold text-lf-ink">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-lf-muted">{c.summary}</p>

                <div className="mt-4 flex gap-2 border-t border-lf-border pt-4">
                  <Button variant="secondary" size="md" className="flex-1" onClick={() => openEdit(c)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="md" onClick={() => togglePublish(c.id)}>
                    {c.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button variant="ghost" size="md" className="text-lf-accent-2 hover:bg-lf-nav" onClick={() => handleDelete(c.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Case Study" : "New Case Study"}>
        <div className="flex flex-col gap-4">
          <Field label="Title">
            <TextInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </Field>
          <Field label="Industry">
            <TextInput value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} />
          </Field>
          <Field label="Summary">
            <TextArea value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} />
          </Field>
          <Field label="Problem">
            <TextArea value={form.problem} onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))} />
          </Field>
          <Field label="Solution">
            <TextArea value={form.solution} onChange={(e) => setForm((f) => ({ ...f, solution: e.target.value }))} />
          </Field>
          <Field label="Result">
            <TextArea value={form.result} onChange={(e) => setForm((f) => ({ ...f, result: e.target.value }))} />
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium text-lf-ink">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              className="h-4 w-4 rounded border-lf-border accent-[#087BFF]"
            />
            Published on website
          </label>
          <div className="mt-2 flex gap-3">
            <Button className="flex-1" onClick={handleSave}>
              {editingId ? "Save Changes" : "Create Case Study"}
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
