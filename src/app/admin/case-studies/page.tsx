"use client";

import { useState } from "react";
import AdminTopbar from "@/components/admin/topbar";
import Modal from "@/components/admin/modal";
import Button from "@/components/ui/button";
import { Field, TextInput, TextArea } from "@/components/ui/form-field";
import { mockCaseStudies } from "@/lib/mock-data";
import type { CaseStudy } from "@/lib/types";

const emptyForm: Omit<CaseStudy, "id" | "createdAt"> = {
  title: "",
  industry: "",
  summary: "",
  problem: "",
  solution: "",
  result: "",
  published: false,
  isDemo: true,
};

export default function AdminCaseStudiesPage() {
  const [items, setItems] = useState<CaseStudy[]>(mockCaseStudies);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

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

  function handleSave() {
    if (!form.title.trim()) return;
    if (editingId) {
      setItems((list) => list.map((c) => (c.id === editingId ? { ...c, ...form } : c)));
    } else {
      setItems((list) => [
        { id: `cs_${Date.now()}`, createdAt: new Date().toISOString(), ...form, isDemo: true },
        ...list,
      ]);
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setItems((list) => list.filter((c) => c.id !== id));
  }

  function togglePublish(id: string) {
    setItems((list) => list.map((c) => (c.id === id ? { ...c, published: !c.published } : c)));
  }

  return (
    <>
      <AdminTopbar title="Case Studies" description="Publish real project write-ups here once available" />

      <div className="flex-1 space-y-5 p-5 md:p-8">
        <div className="rounded-xl border border-lf-accent-2/40 bg-lf-nav px-4 py-3 text-sm text-lf-accent-2">
          The entries below are clearly-marked demo placeholders to show how the layout works — not real
          client case studies. Replace them once you have real projects to publish.
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-lf-muted">{items.length} case studies</p>
          <Button onClick={openCreate}>+ Add Case Study</Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((c) => (
            <div key={c.id} className="flex flex-col rounded-2xl border border-lf-border bg-lf-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                {c.isDemo && (
                  <span className="rounded-full bg-lf-nav px-2.5 py-1 text-[11px] font-semibold text-lf-accent-2">
                    DEMO
                  </span>
                )}
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
