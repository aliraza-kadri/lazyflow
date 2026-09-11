import { Section, SectionHeading } from "@/components/ui/section";
import { businessProblems } from "@/lib/content";

export default function BusinessProblems() {
  return (
    <Section className="py-24 md:py-28">
      <SectionHeading
        eyebrow="The Real Cost"
        title="Every business is quietly losing hours to the same problems"
        description="These rarely look urgent day-to-day. But they add up — in lost leads, slow response times, and a team that's busy instead of productive."
      />

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {businessProblems.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-lf-border bg-lf-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-lf-accent/60 hover:shadow-[0_20px_40px_-24px_rgba(8,123,255,0.2)]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-lf-accent-soft">
              <span className="h-2 w-2 rounded-full lf-gradient-bg" />
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-lf-ink">{p.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-lf-muted">{p.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
