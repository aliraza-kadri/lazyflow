import type { Metadata } from "next";
import PageHeader from "@/components/layout/page-header";
import { Section, SectionHeading } from "@/components/ui/section";
import { howItWorksSteps } from "@/lib/content";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Understand → Identify → Design → Automate → Optimize. The process behind every automation LazyFlow builds.",
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="How It Works"
        title="A disciplined process, not a sales pitch"
        description="We don't start with a tool or a package. We start by understanding your business, then work through a clear process to design and build the right automation."
      />

      <Section className="py-24 md:py-28">
        <div className="mx-auto flex max-w-3xl flex-col gap-0">
          {howItWorksSteps.map((s, i) => (
            <div key={s.step} className="relative flex gap-7 pb-14 last:pb-0">
              {i < howItWorksSteps.length - 1 && (
                <span className="absolute left-[27px] top-14 h-[calc(100%-2.5rem)] w-px bg-lf-border" />
              )}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl lf-gradient-bg text-lg font-bold text-white shadow-[0_10px_24px_-10px_rgba(8,123,255,0.45)]">
                {s.step}
              </div>
              <div className="pt-1.5">
                <h3 className="text-xl font-semibold text-lf-ink">{s.title}</h3>
                <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-lf-muted">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="bg-lf-surface">
        <Section className="py-24">
          <SectionHeading
            eyebrow="Why It Matters"
            title="Good automation isn't about tools. It's about process."
            description="Skip straight to a tool and you get something that looks automated but doesn't actually fix the problem. Our process exists to make sure that doesn't happen."
          />
        </Section>
      </div>

      <Section className="py-20 text-center">
        <h2 className="text-2xl font-bold text-lf-ink md:text-3xl">
          Ready to start with step one?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-lf-muted">
          A short conversation is all it takes for us to start understanding your business.
        </p>
        <div className="mt-8 flex justify-center">
          <WhatsAppButton message={whatsappMessages.talkToUs} size="lg">
            Talk to Us
          </WhatsAppButton>
        </div>
      </Section>
    </>
  );
}
