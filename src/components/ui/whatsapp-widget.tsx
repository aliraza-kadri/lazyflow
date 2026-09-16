"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function FloatingWhatsAppWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState(siteConfig.whatsappNumber);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Fetch live WhatsApp number from settings and restore saved user details
  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
      })
      .catch(() => {});

    try {
      const savedName = localStorage.getItem("lf_user_name");
      const savedPhone = localStorage.getItem("lf_user_phone");
      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);
    } catch {}
  }, []);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    startTransition(async () => {
      try {
        // Save to localStorage for convenience
        try {
          if (name.trim()) localStorage.setItem("lf_user_name", name.trim());
          if (phone.trim()) localStorage.setItem("lf_user_phone", phone.trim());
        } catch {}

        // Send lead to Admin API
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim() || "WhatsApp Visitor",
            phone: phone.trim(),
            problem: message.trim() || "Enquiry from Floating WhatsApp Widget",
            source: "WhatsApp Widget",
            status: "New",
          }),
        });

        setHasSubmitted(true);

        // Build WhatsApp text
        let greeting = `Hi LazyFlow, I would like to enquire about business automation.`;
        if (name.trim()) {
          greeting = `Hi LazyFlow, I am ${name.trim()}. ${message.trim() ? message.trim() : "I would like to discuss automating our business processes."}`;
        } else if (message.trim()) {
          greeting = `Hi LazyFlow, ${message.trim()}`;
        }

        const link = buildWhatsAppLink(greeting, whatsappNumber);
        window.open(link, "_blank", "noopener,noreferrer");

        setTimeout(() => {
          setIsOpen(false);
          setHasSubmitted(false);
        }, 1500);
      } catch (err) {
        // Open WhatsApp even if network request had an issue
        const fallbackText = name.trim()
          ? `Hi LazyFlow, I am ${name.trim()}. I'd like to discuss business automation.`
          : `Hi LazyFlow, I'd like to discuss business automation.`;
        window.open(buildWhatsAppLink(fallbackText, whatsappNumber), "_blank", "noopener,noreferrer");
      }
    });
  };

  const handleDirectOpen = () => {
    // Record direct click
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim() || "WhatsApp Click",
        phone: phone.trim() || "Direct Click",
        problem: "User clicked direct WhatsApp link from widget",
        source: "WhatsApp Direct",
        status: "New",
      }),
    }).catch(() => {});

    window.open(
      buildWhatsAppLink("Hi LazyFlow, I'd like to discuss business automation.", whatsappNumber),
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Popup */}
      {isOpen && (
        <div className="mb-4 w-[340px] sm:w-[380px] overflow-hidden rounded-3xl border border-lf-border bg-lf-card shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-emerald-600 bg-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold tracking-wide leading-snug">LazyFlow Automation</h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Online • Replies in minutes
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close WhatsApp chat"
              className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Message Bubble */}
          <div className="bg-lf-surface/50 p-4 border-b border-lf-border/70">
            <div className="rounded-2xl rounded-tl-none bg-lf-card border border-lf-border/80 p-3.5 shadow-sm text-sm text-lf-ink">
              <p className="leading-relaxed">
                Hi there! 👋 Want to automate repetitive tasks or scale your business operations?
              </p>
              <p className="mt-2 text-xs text-lf-muted">
                Drop your details below to directly connect on WhatsApp:
              </p>
            </div>
          </div>

          {/* Quick Lead Capture Form */}
          <form onSubmit={handleStartChat} className="p-4 space-y-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-lf-muted block mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-lf-border bg-lf-surface px-3 py-2 text-sm text-lf-ink placeholder:text-lf-muted/60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-lf-muted block mb-1">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-lf-border bg-lf-surface px-3 py-2 text-sm text-lf-ink placeholder:text-lf-muted/60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-lf-muted block mb-1">
                Process or Problem (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. WhatsApp leads follow-up / Orders sync"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-lf-border bg-lf-surface px-3 py-2 text-sm text-lf-ink placeholder:text-lf-muted/60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 px-4 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-all disabled:opacity-50"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              {hasSubmitted ? "Connecting to WhatsApp..." : isPending ? "Saving details..." : "Start WhatsApp Chat"}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleDirectOpen}
                className="text-[11px] text-lf-muted hover:text-emerald-600 transition-colors underline"
              >
                Or skip and open WhatsApp directly →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div className="relative group">
        {!isOpen && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-lf-card/95 border border-lf-border px-3 py-1.5 text-xs font-medium text-lf-ink shadow-lg backdrop-blur-sm pointer-events-none transition-all opacity-95 group-hover:opacity-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Chat with us on WhatsApp
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open WhatsApp conversation"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 hover:scale-105 hover:bg-emerald-600 active:scale-95 transition-all duration-200"
        >
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-7 w-7 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
