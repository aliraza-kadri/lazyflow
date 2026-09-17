import type { Metadata } from "next";
import PageHeader from "@/components/layout/page-header";
import { Section, SectionHeading, Eyebrow } from "@/components/ui/section";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import { whatsappMessages } from "@/lib/whatsapp";
import { getContent } from "@/lib/db";

export const metadata: Metadata = {
  title: "About",
  description:
    "LazyFlow is a business automation studio built on one idea: understand the business first, then design the automation.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const values = [
  {
    title: "Understand before we build",
    desc: "We don't propose automation until we understand how your business actually operates.",
  },
  {
    title: "No fixed packages",
    desc: "We've never believed in one-size-fits-all automation bundles. Every business is different.",
  },
  {
    title: "The tool is never the point",
    desc: "n8n, WhatsApp, AI, APIs — these are means to an end. The problem always comes first.",
  },
  {
    title: "Built to last",
    desc: "We design automation that keeps working and improving as your business grows — not one-off fixes.",
  },
];

export default async function AboutPage() {
  const content = await getContent();

  return (
    <>
      <PageHeader
        eyebrow="About LazyFlow"
        title="We started LazyFlow to fix a simple problem with automation"
        description="Too much of the industry sells pre-built packages instead of solving real problems. We wanted to build it differently."
      />

      <Section className="py-24 md:py-28">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Eyebrow>Our Story</Eyebrow>
            <h2 className="mt-5 text-2xl font-bold leading-snug tracking-tight text-lf-ink md:text-3xl">
              Business-first automation, not tool-first automation
            </h2>
            <div className="mt-5 flex flex-col gap-4 text-[15px] leading-relaxed text-lf-muted">
              {content.aboutText ? (
                <p className="whitespace-pre-line">{content.aboutText}</p>
              ) : (
                <>
                  <p>
                    LazyFlow began with a simple observation: most businesses don&apos;t need
                    more software — they need someone to actually look at how they work and
                    fix what&apos;s repetitive, manual or broken.
                  </p>
                  <p>
                    So instead of selling fixed automation packages, we built LazyFlow around a
                    process: understand the business, identify the real problems, design the
                    right automation, implement it properly, and keep improving it.
                  </p>
                </>
              )}
            </div>
          </div>

          <div>
            <Eyebrow>Where We&apos;re Headed</Eyebrow>
            <h2 className="mt-5 text-2xl font-bold leading-snug tracking-tight text-lf-ink md:text-3xl">
              Building toward a serious automation & technology company
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-lf-muted">
              LazyFlow is growing deliberately — from hands-on automation work with individual
              businesses today, toward becoming a technology company that builds durable
              automation infrastructure for many businesses. Every project we take on today
              is part of that foundation.
            </p>
          </div>
        </div>
      </Section>

      <div className="bg-lf-surface">
        <Section className="py-24 md:py-28">
          <SectionHeading
            eyebrow="What We Believe"
            title="A few principles that don't change, regardless of the project"
          />
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-lf-border bg-lf-card p-6">
                <h3 className="text-[15px] font-semibold text-lf-ink">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-lf-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section className="py-20 text-center">
        <h2 className="text-2xl font-bold text-lf-ink md:text-3xl">
          Want to know if we&apos;re the right fit for your business?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-lf-muted">
          Tell us what you do and what&apos;s slowing you down — we&apos;ll tell you honestly
          whether automation will help.
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
