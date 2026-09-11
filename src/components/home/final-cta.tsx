import { Section } from "@/components/ui/section";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import { whatsappMessages } from "@/lib/whatsapp";

export default function FinalCta() {
  return (
    <div className="relative overflow-hidden bg-lf-deep">
      <div className="absolute inset-0 lf-grid-fade" />
      <div className="absolute top-1/2 left-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(8,123,255,0.25),transparent)] blur-2xl" />
      <Section className="relative py-24 md:py-32">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-lf-ink md:text-[2.75rem]">
            Tell us what&apos;s slowing your business down.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-lf-muted md:text-lg">
            One conversation is usually enough to spot the first automation worth building.
          </p>
          <div className="mt-9">
            <WhatsAppButton message={whatsappMessages.findAutomation} size="lg">
              Find My Automation
            </WhatsAppButton>
          </div>
        </div>
      </Section>
    </div>
  );
}
