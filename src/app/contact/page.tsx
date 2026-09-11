import type { Metadata } from "next";
import PageHeader from "@/components/layout/page-header";
import { Section } from "@/components/ui/section";
import ContactForm from "@/components/contact/contact-form";
import { siteConfig } from "@/config/site";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell LazyFlow about your business and what's slowing it down.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's understand your business first"
        description="Share a few details below, or message us directly on WhatsApp — either way, we'll get back to you personally."
      />

      <Section className="py-24 md:py-28">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-xl font-semibold text-lf-ink">Prefer to just chat?</h2>
              <p className="mt-2 text-sm leading-relaxed text-lf-muted">
                Message us on WhatsApp directly — no form required.
              </p>
              <div className="mt-5">
                <WhatsAppButton message={whatsappMessages.talkToUs} variant="dark">
                  Chat on WhatsApp
                </WhatsAppButton>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-lf-border bg-lf-surface p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-lf-muted">Email</p>
                <a href={`mailto:${siteConfig.email}`} className="text-sm font-medium text-lf-ink">
                  {siteConfig.email}
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-lf-muted">Website</p>
                <p className="text-sm font-medium text-lf-ink">{siteConfig.domain}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-lf-muted">Response Time</p>
                <p className="text-sm font-medium text-lf-ink">Usually within 1 business day</p>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </Section>
    </>
  );
}
