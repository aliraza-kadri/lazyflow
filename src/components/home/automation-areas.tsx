import { Section, SectionHeading } from "@/components/ui/section";
import { automationAreas } from "@/lib/content";

export default function AutomationAreas() {
  return (
    <Section className="py-24 md:py-28">
      <SectionHeading
        eyebrow="Where We Help"
        title="Automation areas we commonly work in"
        description="These are examples of what we build — not fixed packages. Your automation is designed around your specific problem, often combining several of these."
      />

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {automationAreas.map((a) => (
          <div
            key={a.title}
            className="group relative overflow-hidden rounded-2xl border border-lf-border bg-lf-card p-7"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-lf-accent-soft opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <h3 className="relative text-[17px] font-semibold text-lf-ink">{a.title}</h3>
            <p className="relative mt-2.5 text-sm leading-relaxed text-lf-muted">{a.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
