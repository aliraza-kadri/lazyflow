// ============================================================================
// LazyFlow — Central Site Configuration
// Change contact details, socials and copy here. Nothing else needs editing.
// ============================================================================

export const siteConfig = {
  name: "LazyFlow",
  domain: "lazyflow.in",
  url: "https://lazyflow.in",
  tagline: "Business Automation, Done Properly.",
  description:
    "LazyFlow helps businesses identify repetitive work, remove bottlenecks and build custom automation that makes operations simpler and more efficient.",

  // ⚠️ Change this number to update EVERY WhatsApp button on the site.
  // Use full international format, digits only (no +, spaces or dashes).
  whatsappNumber: "917016647163",

  email: "hello.lazyflow@gmail.com",

  social: {
    instagram: "https://www.instagram.com/lazyflow.in?stkn=MThhMXRhaG5naHY3eg==",
    linkedin: "https://www.linkedin.com/company/lazyflow-ai/",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Solutions", href: "/solutions" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

export type SiteConfig = typeof siteConfig;
