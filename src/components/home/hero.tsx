import WhatsAppButton from "@/components/ui/whatsapp-button";
import { whatsappMessages } from "@/lib/whatsapp";
import { Section } from "@/components/ui/section";
import { getContent } from "@/lib/db";

export default async function Hero() {
  const content = await getContent();

  const headingLines = content.heroHeading ? content.heroHeading.split("\n") : [
    "Your business has problems.",
    "We build the systems to solve them.",
  ];

  return (
    <div className="relative overflow-hidden bg-lf-deep">
      <div className="absolute inset-0 lf-grid-fade" />
      <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(8,123,255,0.3),transparent)] blur-2xl" />
      <div className="absolute top-20 right-0 h-[380px] w-[380px] rounded-full bg-[radial-gradient(closest-side,rgba(24,200,255,0.2),transparent)] blur-2xl" />

      <Section className="relative pt-24 pb-28 md:pt-32 md:pb-36">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-lf-border bg-lf-nav px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-lf-muted">
            <span className="h-1.5 w-1.5 rounded-full lf-gradient-bg" />
            Business Automation Solutions
          </div>

          <h1 className="mt-7 text-4xl font-bold leading-[1.08] tracking-tight text-lf-ink md:text-6xl whitespace-pre-line">
            {headingLines.map((line, idx) => {
              if (line.includes("systems")) {
                const parts = line.split("systems");
                return (
                  <span key={idx}>
                    {parts[0]}
                    <span className="lf-gradient-text">systems</span>
                    {parts[1]}
                    {idx < headingLines.length - 1 && <br />}
                  </span>
                );
              }
              return (
                <span key={idx}>
                  {line}
                  {idx < headingLines.length - 1 && <br />}
                </span>
              );
            })}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-lf-muted md:text-lg">
            {content.heroDescription}
          </p>

          <div className="mt-10 flex flex-col gap-3.5 sm:flex-row">
            <WhatsAppButton message={whatsappMessages.automateMyBusiness} size="lg">
              {content.ctaPrimaryText || "Automate My Business"}
            </WhatsAppButton>
            <WhatsAppButton message={whatsappMessages.talkToUs} variant="secondary" size="lg">
              {content.ctaSecondaryText || "Talk to Us"}
            </WhatsAppButton>
          </div>

          <p className="mt-6 text-xs text-lf-muted">
            No fixed packages. We design automation around your actual problems.
          </p>
        </div>
      </Section>
    </div>
  );
}
