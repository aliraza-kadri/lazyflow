"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/sidebar";

export default function AdminTopbar({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-lf-border bg-lf-nav/95 px-5 backdrop-blur md:px-8">
        <div>
          <h1 className="text-lg font-semibold text-lf-ink md:text-xl">{title}</h1>
          {description && <p className="hidden text-xs text-lf-muted md:block">{description}</p>}
        </div>

        <div className="flex items-center gap-3">
          {action && <div className="flex items-center gap-2">{action}</div>}
          <span className="hidden items-center gap-2 rounded-full border border-lf-accent/30 bg-lf-accent-soft px-3 py-1.5 text-xs font-medium text-lf-accent md:flex">
            <span className="h-2 w-2 rounded-full bg-lf-accent animate-pulse" />
            Live Data — Connected
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full lf-gradient-bg text-xs font-semibold text-white">
            LF
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-lf-border md:hidden"
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-lf-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-lf-nav shadow-xl">
            <AdminSidebar mobile onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
