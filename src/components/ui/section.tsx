import { ReactNode } from "react";

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-6 md:px-10 lg:px-16 ${className}`}>
      <div className="mx-auto max-w-[1180px]">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase ${
        light
          ? "border-lf-border bg-lf-card text-lf-muted"
          : "border-lf-border bg-lf-accent-soft text-lf-accent"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full lf-gradient-bg" />
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  light?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-4 ${align === "center" ? "items-center text-center" : "items-start text-left"}`}>
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <h2
        className={`text-3xl md:text-[2.5rem] font-bold tracking-tight leading-[1.1] max-w-2xl ${
          "text-lf-ink"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className="text-base md:text-lg max-w-xl leading-relaxed text-lf-muted">
          {description}
        </p>
      )}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-lf-border bg-lf-card p-6 transition-all duration-300 hover:border-lf-accent/60 hover:shadow-[0_16px_40px_-20px_rgba(8,123,255,0.2)] ${className}`}
    >
      {children}
    </div>
  );
}
