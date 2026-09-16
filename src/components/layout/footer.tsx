"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { LogoHorizontal } from "@/components/ui/logo";

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState({
    email: siteConfig.email,
    whatsappNumber: siteConfig.whatsappNumber,
    instagram: siteConfig.social.instagram,
    linkedin: siteConfig.social.linkedin,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setSettings((prev) => ({
            email: data.email || prev.email,
            whatsappNumber: data.whatsappNumber || prev.whatsappNumber,
            instagram: data.instagram || prev.instagram,
            linkedin: data.linkedin || prev.linkedin,
          }));
        }
      })
      .catch(() => {});
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-lf-ink text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <LogoHorizontal theme="dark" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              We study how your business actually works, then design and build the
              automation that fixes it.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/90">Company</h4>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-white/55">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/90">Contact</h4>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-white/55">
              <li>
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                  {settings.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li className="text-white/40">{siteConfig.domain}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/90">Follow</h4>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-white/55">
              <li>
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={settings.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 md:flex-row">
          <p>© {new Date().getFullYear()} LazyFlow. All rights reserved.</p>
          <p>Built for businesses that are done doing things manually.</p>
        </div>
      </div>
    </footer>
  );
}
