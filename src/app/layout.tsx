import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import FloatingWhatsAppWidget from "@/components/ui/whatsapp-widget";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Business Automation`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
      { url: "/logo/lazyflow-icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo/lazyflow-icon.png",
  },
  keywords: [
    "business automation",
    "workflow automation",
    "WhatsApp automation",
    "AI automation",
    "n8n automation",
    "CRM automation",
    "LazyFlow",
  ],
  openGraph: {
    title: `${siteConfig.name} — Business Automation`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col antialiased"
        style={{
          fontFamily:
            "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWhatsAppWidget />
      </body>
    </html>
  );
}
