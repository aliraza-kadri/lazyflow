import { Section, Eyebrow } from "@/components/ui/section";

const points = [
  {
    title: "We start with your business, not a tool",
    desc: "Before any automation, we understand how your team actually works — the process, the people, the friction.",
  },
  {
    title: "We solve problems, not sell packages",
    desc: "There's no fixed 'automation bundle'. What we build depends entirely on what's actually slowing you down.",
  },
  {
    title: "We use whatever tool fits",
    desc: "n8n, WhatsApp, AI, APIs, your CRM — the tool is a means to an end. The problem decides the solution.",
  },
];

export default function WhatWeDo() {
  return (
    <Section className="py-24 md:py-28">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Eyebrow>Our Approach</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold leading-[1.15] tracking-tight text-lf-ink md:text-[2.5rem]">
            We don&apos;t sell automation packages. We solve business problems.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-lf-muted md:text-lg">
            Most agencies start with a tool and try to fit your business around it.
            We do the opposite — we study how your business runs, find what&apos;s
            actually repetitive or broken, and design automation specifically for that.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {points.map((p, i) => (
            <div
              key={p.title}
              className="flex gap-5 rounded-2xl border border-lf-border bg-lf-card p-6"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full lf-gradient-bg text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="text-[15px] font-semibold text-lf-ink">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-lf-muted">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
