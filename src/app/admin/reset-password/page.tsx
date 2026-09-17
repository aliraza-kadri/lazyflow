"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogoHorizontal } from "@/components/ui/logo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      return;
    }

    fetch(`/api/auth/reset-password-token?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setTokenValid(true);
          setAccountEmail(data.email || "");
        } else {
          setTokenValid(false);
        }
      })
      .catch(() => setTokenValid(false))
      .finally(() => setVerifying(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
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
      const res = await fetch("/api/auth/reset-password-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
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

  if (verifying) {
    return (
      <div className="text-center py-12 text-sm text-lf-muted">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-lf-accent border-t-transparent" />
        Verifying secure link...
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-lf-ink">Link Expired or Invalid</h2>
        <p className="mt-2 text-xs text-lf-muted leading-relaxed">
          This password reset link is invalid, has expired (after 30 minutes), or was already used.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/admin/forgot-password"
            className="rounded-xl lf-gradient-bg px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:opacity-90"
          >
            Request New Reset Link
          </Link>
          <Link
            href="/admin/login"
            className="rounded-xl border border-lf-border bg-lf-surface px-5 py-2.5 text-xs font-semibold text-lf-ink hover:bg-lf-surface/80"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-lf-ink">Set New Password</h1>
        <p className="mt-1.5 text-xs text-lf-muted">
          Choose a new password for account:{" "}
          <strong className="text-lf-ink">{accountEmail}</strong>
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
          <span>✅ Password updated successfully! Signing you in...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              Saving Password...
            </>
          ) : (
            "Save Password & Sign In"
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-lf-deep p-4 sm:p-6">
      <div className="absolute inset-0 lf-grid-fade opacity-70" />
      <div className="absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(8,123,255,0.25),transparent)] blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-[radial-gradient(closest-side,rgba(24,200,255,0.15),transparent)] blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoHorizontal />
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-lf-border bg-lf-nav px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-lf-muted">
            <span className="h-1.5 w-1.5 rounded-full lf-gradient-bg" />
            Account Recovery
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-lf-border/90 bg-lf-card/90 p-7 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-9">
          <Suspense fallback={<div className="text-center py-12 text-sm text-lf-muted">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
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
