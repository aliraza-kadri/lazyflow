"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { LogoHorizontal, LogoIcon } from "@/components/ui/logo";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import { whatsappMessages } from "@/lib/whatsapp";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-lf-nav/95 backdrop-blur-md border-b border-lf-border" : "bg-lf-nav/0 border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6 md:px-10 lg:px-16">
        <LogoHorizontal className="hidden sm:inline-flex" />
        <Link href="/" aria-label="LazyFlow home" className="sm:hidden">
          <LogoIcon />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {siteConfig.nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "text-lf-ink" : "text-lf-muted hover:text-lf-ink"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-[2px] lf-gradient-bg rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <WhatsAppButton message={whatsappMessages.talkToUs} variant="secondary" size="md">
            Talk to Us
          </WhatsAppButton>
          <WhatsAppButton message={whatsappMessages.automateMyBusiness} variant="primary" size="md">
            Automate My Business
          </WhatsAppButton>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-lf-border lg:hidden"
        >
          <div className="flex flex-col gap-[5px]">
            <span
              className={`h-[1.5px] w-5 bg-lf-ink transition-transform ${open ? "translate-y-[6.5px] rotate-45" : ""}`}
            />
            <span className={`h-[1.5px] w-5 bg-lf-ink transition-opacity ${open ? "opacity-0" : ""}`} />
            <span
              className={`h-[1.5px] w-5 bg-lf-ink transition-transform ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`}
            />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-lf-border bg-lf-nav px-6 pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border-b border-lf-border/70 py-3.5 text-[15px] font-medium ${
                  pathname === item.href ? "text-lf-ink" : "text-lf-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 flex flex-col gap-3">
            <WhatsAppButton message={whatsappMessages.talkToUs} variant="secondary" className="w-full">
              Talk to Us
            </WhatsAppButton>
            <WhatsAppButton message={whatsappMessages.automateMyBusiness} variant="primary" className="w-full">
              Automate My Business
            </WhatsAppButton>
          </div>
        </div>
      )}
    </header>
  );
}
