import { Section, SectionHeading } from "@/components/ui/section";
import { getCaseStudies, getSettings } from "@/lib/db";
import { siteConfig } from "@/config/site";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default async function CaseStudies() {
  const [allCaseStudies, settings] = await Promise.all([
    getCaseStudies(),
    getSettings(),
  ]);

  const publishedStudies = (allCaseStudies || []).filter((c) => c.published);

  if (!publishedStudies.length) return null;

  const whatsappNumber = (settings?.whatsappNumber || siteConfig.whatsappNumber).replace(/\D/g, "");

  return (
    <div className="bg-lf-surface border-y border-lf-border/60">
      <Section className="py-24 md:py-28">
        <SectionHeading
          eyebrow="Case Studies"
          title="Real problems. Custom workflows. Measurable results."
          description="See how our tailored business automation systems cut repetitive work and eliminate operational bottlenecks."
        />

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {publishedStudies.map((cs) => (
            <div
              key={cs.id}
              className="group flex flex-col justify-between rounded-3xl border border-lf-border bg-lf-card p-7 sm:p-8 shadow-sm transition-all duration-300 hover:border-lf-accent/60 hover:shadow-[0_20px_40px_-20px_rgba(8,123,255,0.18)]"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-lf-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-lf-accent">
                    {cs.industry}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Implementation
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-bold text-lf-ink leading-snug">
                  {cs.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-lf-muted">
                  {cs.summary}
                </p>

                <div className="mt-6 flex flex-col gap-3.5 rounded-2xl bg-lf-surface/80 p-5 border border-lf-border/70">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-500 block mb-1">
                      The Bottleneck / Problem
                    </span>
                    <p className="text-xs sm:text-sm text-lf-ink/85 leading-relaxed">
                      {cs.problem}
                    </p>
                  </div>
                  <div className="border-t border-lf-border/50 pt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-lf-accent block mb-1">
                      Our Automation Solution
                    </span>
                    <p className="text-xs sm:text-sm text-lf-ink/85 leading-relaxed">
                      {cs.solution}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                  <div className="flex items-start gap-2.5">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                        Measurable Result
                      </span>
                      <p className="mt-0.5 text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-200 leading-relaxed">
                        {cs.result}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-lf-border/60 pt-5">
                <a
                  href={buildWhatsAppLink(
                    `Hi LazyFlow, I read the case study "${cs.title}" and want to discuss something similar for my business.`,
                    whatsappNumber
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-lf-accent"
                >
                  Discuss a Similar Solution
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
