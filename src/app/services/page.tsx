import type { Metadata } from "next";
import PageHeader from "@/components/layout/page-header";
import { Section, SectionHeading, Card } from "@/components/ui/section";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import { whatsappMessages } from "@/lib/whatsapp";
import { getServices } from "@/lib/db";

export const metadata: Metadata = {
  title: "Services",
  description:
    "WhatsApp, AI, workflow, lead, CRM and custom business automation — designed around your specific problems, not sold as fixed packages.",
};

const detail: Record<string, string[]> = {
  "WhatsApp Automation": [
    "Instant auto-replies for common questions",
    "Lead capture directly from chats",
    "Order and status updates",
    "Broadcast & re-engagement flows",
  ],
  "AI Automation": [
    "AI-assisted replies and triage",
    "Document & data summarisation",
    "Smart routing to the right person",
    "AI-powered internal assistants",
  ],
  "Workflow Automation": [
    "Multi-step internal processes connected end-to-end",
    "Approvals and handoffs without manual chasing",
    "Scheduled and trigger-based tasks",
    "Systems that talk to each other",
  ],
  "Lead & Follow-up Automation": [
    "Instant response to new enquiries",
    "Automatic qualification",
    "Scheduled follow-up sequences",
    "No lead left untouched",
  ],
  "CRM Automation": [
    "Automatic contact & deal updates",
    "Status changes triggered by real activity",
    "Clean, de-duplicated customer data",
    "Reminders based on CRM activity",
  ],
  "Custom Business Automation": [
    "Built around a process unique to you",
    "Custom integrations via API",
    "Internal tools where nothing off-the-shelf fits",
    "Anything repetitive, examined case by case",
  ],
};

export default async function ServicesPage() {
  const allServices = await getServices();
  const activeServices = allServices.filter((s) => s.active);

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Automation, built around your problem — not a package"
        description="These are the areas we most commonly work in. In practice, most projects combine two or three of these to solve one real business problem."
      />

      <Section className="py-24 md:py-28">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {activeServices.map((s) => (
            <Card key={s.id} className="flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-lf-ink">{s.title}</h3>
                {s.category && (
                  <span className="rounded-full bg-lf-accent-soft px-2.5 py-1 text-[11px] font-semibold text-lf-accent">
                    {s.category}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-lf-muted">{s.description}</p>
              {detail[s.title] && (
                <ul className="mt-5 flex flex-col gap-2.5 border-t border-lf-border pt-5">
                  {detail[s.title].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-lf-ink/80">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full lf-gradient-bg" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-lf-border bg-lf-surface p-6 text-center text-sm text-lf-muted">
          These are examples of what we build, not fixed packages. Your actual automation
          is designed after we understand your business.
        </div>
      </Section>

      <div className="bg-lf-surface">
        <Section className="py-20">
          <SectionHeading
            eyebrow="Not Sure What You Need?"
            title="Tell us your process. We'll tell you what's worth automating."
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
