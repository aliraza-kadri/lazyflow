"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoHorizontal } from "@/components/ui/logo";

const links = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/leads", label: "Leads", icon: "users" },
  { href: "/admin/services", label: "Services", icon: "layers" },
  { href: "/admin/case-studies", label: "Case Studies", icon: "file" },
  { href: "/admin/content", label: "Website Content", icon: "edit" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

function Icon({ name }: { name: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "grid":
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
    case "users":
      return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><circle cx="17.5" cy="8.5" r="2.6" /><path d="M15.5 14.2c2.7.3 5 2.2 5 5.3" /></svg>;
    case "layers":
      return <svg {...common}><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></svg>;
    case "file":
      return <svg {...common}><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6" /></svg>;
    case "edit":
      return <svg {...common}><path d="M4 20h4l11-11-4-4L4 16v4z" /></svg>;
    case "settings":
      return <svg {...common}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 13.5a1.8 1.8 0 000-3l1.2-1.4-1.7-2.9-1.8.5a1.8 1.8 0 00-2.6-1.5L14 3h-4l-.5 1.9a1.8 1.8 0 00-2.6 1.5l-1.8-.5-1.7 2.9L4.6 10.5a1.8 1.8 0 000 3L3.4 15l1.7 2.9 1.8-.5a1.8 1.8 0 002.6 1.5L10 21h4l.5-1.9a1.8 1.8 0 002.6-1.5l1.8.5 1.7-2.9-1.2-1.7z" /></svg>;
    default:
      return null;
  }
}

export default function AdminSidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className={`flex h-full flex-col ${mobile ? "" : "w-64 shrink-0 border-r border-lf-border bg-lf-nav"}`}>
      <div className="flex h-[72px] items-center border-b border-lf-border px-6">
        <LogoHorizontal />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-5">
        {links.map((l) => {
          const active = l.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-lf-accent-soft text-lf-accent" : "text-lf-muted hover:bg-lf-surface hover:text-lf-ink"
              }`}
            >
              <Icon name={l.icon} />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-lf-border p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-lf-muted hover:bg-lf-surface hover:text-lf-ink"
        >
          ← Back to website
        </Link>
      </div>
    </div>
  );
}
