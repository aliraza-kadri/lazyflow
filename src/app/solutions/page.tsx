import type { Metadata } from "next";
import PageHeader from "@/components/layout/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { solutions } from "@/lib/content";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import { whatsappMessages, buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Automation solutions across retail, garments, restaurants, salons, clinics, real estate, e-commerce and service businesses.",
};

export default function SolutionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Solutions"
        title="Different businesses, similar repetitive work"
        description="We've grouped where automation tends to help most by industry — but every solution is still designed around your specific process, not a generic industry template."
      />

      <Section className="py-24 md:py-28">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {solutions.map((s) => (
            <div
              key={s.title}
              className="group flex flex-col justify-between rounded-2xl border border-lf-border bg-lf-card p-7 transition-all duration-300 hover:border-lf-accent/60 hover:shadow-[0_20px_40px_-24px_rgba(8,123,255,0.2)]"
            >
              <div>
                <h3 className="text-lg font-semibold text-lf-ink">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-lf-muted">{s.desc}</p>
              </div>
              <a
                href={buildWhatsAppLink(
                  `Hi LazyFlow, I run a ${s.title.toLowerCase()} business and want to explore automation for it.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-lf-accent"
              >
                Discuss for {s.title}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          ))}
        </div>
      </Section>

      <div className="bg-lf-surface">
        <Section className="py-20 text-center">
          <SectionHeading
            eyebrow="Not Listed?"
            title="Automation isn't industry-specific — it's process-specific"
            description="If your business has repetitive, manual or disconnected work, we can very likely help — regardless of industry."
          />
          <div className="mt-8 flex justify-center">
            <WhatsAppButton message={whatsappMessages.automateMyBusiness} size="lg">
              Automate My Business
            </WhatsAppButton>
          </div>
        </Section>
      </div>
    </>
  );
}
