import Link from "next/link";
import Button from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center px-6 py-24 lf-grid-fade">
      <div className="mx-auto max-w-lg text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-lf-border bg-lf-card px-3.5 py-1 text-xs font-semibold text-lf-accent mb-6 shadow-sm">
          <span>404 Error</span>
          <span>•</span>
          <span className="text-lf-muted">Page Not Found</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-lf-ink sm:text-5xl">
          Looks like this automation <span className="lf-gradient-text">hit a dead end.</span>
        </h1>

        <p className="mt-4 text-base leading-relaxed text-lf-muted">
          The page you are looking for doesn&apos;t exist, may have moved, or the link might be broken.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/">
            <Button size="lg">Back to Homepage →</Button>
          </Link>
          <Link href="/contact">
            <Button variant="secondary" size="lg">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
