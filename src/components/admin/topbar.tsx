"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AdminSidebar from "@/components/admin/sidebar";
import Modal from "@/components/admin/modal";

interface DbStatus {
  connected: boolean;
  message?: string;
  hasMongoUriEnv?: boolean;
}

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
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetch("/api/db-status", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setDbStatus(data))
      .catch(() => setDbStatus({ connected: false, message: "Could not reach database API." }));
  }, []);

  return (
    <>
      <div className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-lf-border bg-lf-nav/95 px-5 backdrop-blur md:px-8">
        <div>
          <h1 className="text-lg font-semibold text-lf-ink md:text-xl">{title}</h1>
          {description && <p className="hidden text-xs text-lf-muted md:block">{description}</p>}
        </div>

        <div className="flex items-center gap-3">
          {action && <div className="flex items-center gap-2">{action}</div>}

          {/* Real Live Database Status Pill */}
          {dbStatus === null ? (
            <span className="hidden items-center gap-2 rounded-full border border-lf-border bg-lf-surface px-3 py-1.5 text-xs font-medium text-lf-muted md:flex">
              <span className="h-2 w-2 rounded-full bg-lf-muted animate-pulse" />
              Checking Database...
            </span>
          ) : dbStatus.connected ? (
            <span
              onClick={() => setShowStatusModal(true)}
              className="hidden cursor-pointer items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/20 md:flex transition-colors"
              title="Click to view database connection details"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              MongoDB Atlas: Connected
            </span>
          ) : (
            <span
              onClick={() => setShowStatusModal(true)}
              className="cursor-pointer flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/20 transition-colors animate-pulse"
              title="Click to see how to connect MongoDB on Vercel"
            >
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Database Disconnected ⚠️
            </span>
          )}

          <Link
            href="/admin/settings"
            title="LazyFlow Admin"
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-lf-surface transition-all group"
          >
            <Image
              src="/logo/lazyflow-icon.png"
              alt="LazyFlow Logo"
              width={36}
              height={36}
              className="h-8 w-8 object-contain transition-transform group-hover:scale-105"
              priority
            />
          </Link>

          <button
            onClick={async () => {
              if (confirm("Are you sure you want to log out?")) {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/admin/login";
              }
            }}
            title="Log out of Admin"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-lf-border text-lf-muted hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
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

      {/* Disconnected Warning Banner if not connected */}
      {dbStatus && !dbStatus.connected && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-5 py-2.5 text-xs text-red-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>
              <strong>MongoDB Atlas is not connected on Vercel!</strong> Changes made here will reset when page refreshes.
            </span>
          </div>
          <button
            onClick={() => setShowStatusModal(true)}
            className="underline font-semibold hover:text-red-700 ml-4 shrink-0"
          >
            How to fix in 2 steps →
          </button>
        </div>
      )}

      {/* Database Connection Help Modal */}
      <Modal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={dbStatus?.connected ? "MongoDB Atlas Status" : "MongoDB Connection Setup Required"}
      >
        <div className="space-y-4 text-sm text-lf-ink">
          {dbStatus?.connected ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-700">
                ✅ <strong>Connected to MongoDB Atlas: lazyflow</strong>
                <p className="mt-1 text-xs text-emerald-600">
                  Your Admin changes, leads, content, and services are directly saving to your MongoDB Atlas cluster.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-700">
                <strong>Status:</strong> {dbStatus?.message || "Could not connect to MongoDB Atlas cluster."}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-lf-muted">
                  Step 1: Add MONGODB_URI in Vercel
                </h4>
                <ol className="list-decimal pl-5 space-y-1 text-xs text-lf-muted">
                  <li>Open your <strong>Vercel Dashboard</strong> and click on this project (lazyflow).</li>
                  <li>Go to <strong>Settings</strong> → <strong>Environment Variables</strong>.</li>
                  <li>Key: <code className="bg-lf-surface px-1.5 py-0.5 rounded font-mono text-lf-ink">MONGODB_URI</code></li>
                  <li>Paste your MongoDB connection string from <code className="bg-lf-surface px-1.5 py-0.5 rounded font-mono text-lf-ink">.env.local</code>.</li>
                  <li>Save and trigger a new Deployment.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-lf-muted">
                  Step 2: Allow Vercel IP in MongoDB Atlas
                </h4>
                <ol className="list-decimal pl-5 space-y-1 text-xs text-lf-muted">
                  <li>Log in to <strong>MongoDB Atlas</strong> (cloud.mongodb.com).</li>
                  <li>Go to <strong>Network Access</strong> → <strong>Add IP Address</strong>.</li>
                  <li>Click <strong>&quot;Allow Access from Anywhere&quot;</strong> (<code className="font-mono">0.0.0.0/0</code>).</li>
                  <li>Click <strong>Confirm</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShowStatusModal(false)}
              className="rounded-xl bg-lf-ink px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

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
