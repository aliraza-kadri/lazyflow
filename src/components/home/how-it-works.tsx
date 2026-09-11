import { Section, SectionHeading } from "@/components/ui/section";
import { howItWorksSteps } from "@/lib/content";

export default function HowItWorks({ compact = false }: { compact?: boolean }) {
  return (
    <div className="bg-lf-deep">
      <Section className={compact ? "py-24 md:py-28" : "py-24 md:py-32"}>
        <SectionHeading
          light
          eyebrow="Our Process"
          title="A simple, repeatable process behind every automation we build"
          description="No guesswork. Every project follows the same disciplined process — from understanding your business to continuously improving what we build."
        />

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-lf-border bg-lf-border md:grid-cols-5">
          {howItWorksSteps.map((s, i) => (
            <div key={s.step} className="relative bg-lf-card p-7">
              <span className="text-xs font-mono font-semibold text-lf-muted">{s.step}</span>
              <h3 className="mt-4 text-lg font-semibold text-lf-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-lf-muted">{s.desc}</p>
              {i < howItWorksSteps.length - 1 && (
                <span className="pointer-events-none absolute top-1/2 -right-[9px] hidden h-4 w-4 -translate-y-1/2 rotate-45 border-t border-r border-lf-border md:block" />
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
