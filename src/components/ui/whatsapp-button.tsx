"use client";

import Button from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { ReactNode, useEffect, useState } from "react";

export default function WhatsAppButton({
  message,
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon,
}: {
  message: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "dark";
  size?: "md" | "lg";
  className?: string;
  icon?: ReactNode;
}) {
  const [number, setNumber] = useState(siteConfig.whatsappNumber);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/site-settings", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((settings: { whatsappNumber?: string } | null) => {
        if (active && settings?.whatsappNumber) setNumber(settings.whatsappNumber);
      })
      .catch(() => undefined);

    try {
      const savedName = localStorage.getItem("lf_user_name");
      const savedPhone = localStorage.getItem("lf_user_phone");
      const savedBusiness = localStorage.getItem("lf_user_biz");
      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);
      if (savedBusiness) setBusiness(savedBusiness);
    } catch {}

    return () => {
      active = false;
    };
  }, []);

  const handleClick = () => {
    setModalOpen(true);
  };

  const handleProceed = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      try {
        if (name.trim()) localStorage.setItem("lf_user_name", name.trim());
        if (phone.trim()) localStorage.setItem("lf_user_phone", phone.trim());
        if (business.trim()) localStorage.setItem("lf_user_biz", business.trim());
      } catch {}

      // Save lead to Admin Panel
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "WhatsApp Visitor",
          phone: phone.trim() || "Direct on WhatsApp",
          business: business.trim(),
          problem: message || "WhatsApp Enquiry",
          source: "WhatsApp Button",
          status: "New",
        }),
      });

      // Build personalized WhatsApp text
      let fullMessage = message;
      if (name.trim()) {
        fullMessage = `Hi LazyFlow, I am ${name.trim()}${business.trim() ? " from " + business.trim() : ""}.\n${message}`;
      }

      window.open(buildWhatsAppLink(fullMessage, number), "_blank", "noopener,noreferrer");
      setModalOpen(false);
    } catch (err) {
      window.open(buildWhatsAppLink(message, number), "_blank", "noopener,noreferrer");
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectBypass = () => {
    // Record direct click in Admin Panel
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim() || "WhatsApp Visitor",
        phone: phone.trim() || "Pending WhatsApp Chat",
        business: business.trim(),
        problem: message || "Direct WhatsApp CTA Click",
        source: "WhatsApp Direct",
        status: "New",
      }),
    }).catch(() => {});

    window.open(buildWhatsAppLink(message, number), "_blank", "noopener,noreferrer");
    setModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant={variant}
        size={size}
        className={className}
        icon={icon}
      >
        {children}
      </Button>

      {/* Quick Lead Capture Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-lf-border bg-lf-card shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-lf-border px-6 py-4.5 bg-lf-surface/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-lf-ink">Connect on WhatsApp</h3>
                  <p className="text-xs text-lf-muted">LazyFlow Automation Team</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1.5 text-lf-muted hover:bg-lf-surface hover:text-lf-ink transition-colors"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleProceed} className="p-6 space-y-4">
              <p className="text-sm text-lf-muted leading-relaxed">
                Enter your details so our team can immediately understand your business context when you reach out on WhatsApp:
              </p>

              <div>
                <label className="text-xs font-semibold text-lf-ink block mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-lf-border bg-lf-surface px-3.5 py-2.5 text-sm text-lf-ink placeholder:text-lf-muted/60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-lf-ink block mb-1.5">
                  Business / Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sharma Textiles / Retail Store"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  className="w-full rounded-xl border border-lf-border bg-lf-surface px-3.5 py-2.5 text-sm text-lf-ink placeholder:text-lf-muted/60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-lf-ink block mb-1.5">
                  WhatsApp Number <span className="text-xs font-normal text-lf-muted">(Optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210 (Optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-lf-border bg-lf-surface px-3.5 py-2.5 text-sm text-lf-ink placeholder:text-lf-muted/60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 px-4 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  {isSubmitting ? "Connecting..." : "Continue to WhatsApp →"}
                </button>
              </div>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={handleDirectBypass}
                  className="text-xs text-lf-muted hover:text-emerald-600 transition-colors underline"
                >
                  Skip & open WhatsApp directly
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
