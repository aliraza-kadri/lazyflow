import { Section, SectionHeading } from "@/components/ui/section";
import { solutions } from "@/lib/content";

export default function SolutionsGrid({ compact = false }: { compact?: boolean }) {
  return (
    <Section className={compact ? "py-24 md:py-28" : "py-24 md:py-32"}>
      <SectionHeading
        eyebrow="Industries"
        title="Built around how different businesses actually operate"
        description="Every industry has its own repetitive work. Here's where we typically find the biggest automation opportunities — the details always depend on your specific business."
      />

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {solutions.map((s) => (
          <div
            key={s.title}
            className="flex flex-col rounded-2xl border border-lf-border bg-lf-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(8,123,255,0.2)]"
          >
            <h3 className="text-[15px] font-semibold text-lf-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-lf-muted">{s.desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-lf-muted">
        Don&apos;t see your industry? Automation isn&apos;t industry-specific — it&apos;s
        process-specific. If you have repetitive work, we can likely help.
      </p>
    </Section>
  );
}
