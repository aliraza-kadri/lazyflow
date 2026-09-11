"use client";

import { useMemo, useState } from "react";
import { Section, SectionHeading } from "@/components/ui/section";
import WhatsAppButton from "@/components/ui/whatsapp-button";

const problems = [
  {
    id: "whatsapp",
    label: "We reply to the same WhatsApp questions all day",
    suggestion:
      "A WhatsApp auto-response system that instantly answers common questions and routes anything unusual to your team.",
  },
  {
    id: "leads",
    label: "Leads come in but often don't get followed up",
    suggestion:
      "An automated lead-capture and follow-up flow that responds instantly and keeps nudging until a lead is qualified.",
  },
  {
    id: "data-entry",
    label: "Our team re-types the same data across tools",
    suggestion:
      "A workflow that connects your existing tools so data entered once flows everywhere it's needed automatically.",
  },
  {
    id: "orders",
    label: "Orders are tracked manually on WhatsApp or paper",
    suggestion:
      "An order-management flow that logs, tracks and updates customers automatically from a single source of truth.",
  },
  {
    id: "appointments",
    label: "We call/message clients to confirm every appointment",
    suggestion:
      "Automated booking confirmations and reminders that cut no-shows without anyone making manual calls.",
  },
  {
    id: "reports",
    label: "We spend hours building the same reports weekly",
    suggestion:
      "A reporting automation that pulls your numbers together and delivers them on schedule, with no manual work.",
  },
];

const businessSizes = [
  { id: "solo", label: "Just me / very small team" },
  { id: "small", label: "Small team (2–15 people)" },
  { id: "growing", label: "Growing business (15+ people)" },
];

export default function AutomationFinder() {
  const [problemId, setProblemId] = useState<string | null>(null);
  const [sizeId, setSizeId] = useState<string | null>(null);

  const problem = problems.find((p) => p.id === problemId);
  const size = businessSizes.find((s) => s.id === sizeId);

  const message = useMemo(() => {
    if (!problem) return "";
    let msg = `Hi LazyFlow, here's what's slowing my business down: "${problem.label}".`;
    if (size) msg += ` We're a ${size.label.toLowerCase()}.`;
    msg += ` I'd like to discuss automating this.`;
    return msg;
  }, [problem, size]);

  return (
    <div className="bg-lf-surface">
      <Section className="py-24 md:py-28">
        <SectionHeading
          eyebrow="Quick Check"
          title="What can we automate for you?"
          description="Answer two quick questions and we'll show you the kind of automation that typically solves it."
        />

        <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-lf-border bg-lf-card p-6 md:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-lf-accent">Step 1</p>
            <h3 className="mt-1.5 text-lg font-semibold text-lf-ink">
              What&apos;s your biggest day-to-day problem?
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {problems.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProblemId(p.id)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                    problemId === p.id
                      ? "border-lf-accent bg-lf-accent-soft text-lf-ink"
                      : "border-lf-border text-lf-muted hover:border-lf-ink/20 hover:text-lf-ink"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {problem && (
            <div className="mt-8 border-t border-lf-border pt-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-lf-accent">Step 2</p>
              <h3 className="mt-1.5 text-lg font-semibold text-lf-ink">How big is your team?</h3>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {businessSizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSizeId(s.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      sizeId === s.id
                        ? "border-lf-accent bg-lf-accent-soft text-lf-ink"
                        : "border-lf-border text-lf-muted hover:border-lf-ink/20 hover:text-lf-ink"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {problem && size && (
            <div className="mt-8 rounded-2xl border border-lf-accent/20 bg-lf-accent-soft p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-lf-accent">
                A possible starting point
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-lf-ink">{problem.suggestion}</p>
              <p className="mt-3 text-xs text-lf-muted">
                This is a starting suggestion — the actual solution depends on the details of your
                business, which we&apos;ll figure out together.
              </p>
              <div className="mt-5">
                <WhatsAppButton message={message} size="md">
                  Discuss This With LazyFlow
                </WhatsAppButton>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
