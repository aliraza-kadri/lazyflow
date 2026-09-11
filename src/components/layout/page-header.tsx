import { ReactNode } from "react";
import { Section, Eyebrow } from "@/components/ui/section";

export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
}) {
  return (
    <div className="relative overflow-hidden bg-lf-deep">
      <div className="absolute inset-0 lf-grid-fade" />
      <div className="absolute -top-32 left-1/2 h-[420px] w-[780px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(8,123,255,0.25),transparent)] blur-2xl" />
      <Section className="relative pt-20 pb-20 md:pt-28 md:pb-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <Eyebrow light>{eyebrow}</Eyebrow>
          <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-lf-ink md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-xl text-base leading-relaxed text-lf-muted md:text-lg">
              {description}
            </p>
          )}
        </div>
      </Section>
    </div>
  );
}
