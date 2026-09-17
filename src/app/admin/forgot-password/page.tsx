"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoHorizontal } from "@/components/ui/logo";

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const [recoveryPin, setRecoveryPin] = useState("");
  const [newIdentifier, setNewIdentifier] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryPin, newPassword, newIdentifier }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password. Please check your PIN.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-lf-deep p-4 sm:p-6">
      {/* Background Gradients */}
      <div className="absolute inset-0 lf-grid-fade opacity-70" />
      <div className="absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(8,123,255,0.25),transparent)] blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-[radial-gradient(closest-side,rgba(24,200,255,0.15),transparent)] blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Top Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoHorizontal />
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-lf-border bg-lf-nav px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-lf-muted">
            <span className="h-1.5 w-1.5 rounded-full lf-gradient-bg" />
            Security & Recovery
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-lf-border/90 bg-lf-card/90 p-7 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-9">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-lf-ink">Reset Password</h1>
            <p className="mt-1.5 text-xs text-lf-muted">
              Enter your Master Recovery PIN to securely reset your admin password without third-party fees.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-500">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 font-medium">
              <span>✅ Password reset successfully! Redirecting to dashboard...</span>
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-lf-muted">
                Master Recovery PIN
              </label>
              <input
                type="text"
                required
                value={recoveryPin}
                onChange={(e) => setRecoveryPin(e.target.value)}
                placeholder="e.g. 892410"
                className="w-full rounded-xl border border-lf-border bg-lf-surface px-4 py-3 text-sm text-lf-ink font-mono placeholder:text-lf-muted/50 focus:border-lf-accent focus:outline-none focus:ring-1 focus:ring-lf-accent transition-all"
              />
              <p className="mt-1 text-[11px] text-lf-muted">
                Default recovery key: <code className="font-mono text-lf-ink">892410</code> (changeable in Vercel env <code className="font-mono text-lf-ink">ADMIN_RECOVERY_KEY</code>)
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-lf-muted">
                New Admin Username / Email <span className="text-lf-muted/60 normal-case">(Optional)</span>
              </label>
              <input
                type="text"
                value={newIdentifier}
                onChange={(e) => setNewIdentifier(e.target.value)}
                placeholder="Leave blank to keep current, or enter new username/email"
                className="w-full rounded-xl border border-lf-border bg-lf-surface px-4 py-3 text-sm text-lf-ink placeholder:text-lf-muted/50 focus:border-lf-accent focus:outline-none focus:ring-1 focus:ring-lf-accent transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-lf-muted">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-lf-border bg-lf-surface px-4 py-3 text-sm text-lf-ink placeholder:text-lf-muted/50 focus:border-lf-accent focus:outline-none focus:ring-1 focus:ring-lf-accent transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-lf-muted">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-lf-border bg-lf-surface px-4 py-3 text-sm text-lf-ink placeholder:text-lf-muted/50 focus:border-lf-accent focus:outline-none focus:ring-1 focus:ring-lf-accent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl lf-gradient-bg py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-lf-accent/25 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Updating Password...
                </>
              ) : (
                "Reset Password & Sign In"
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/admin/login"
            className="text-xs font-medium text-lf-accent hover:underline transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
