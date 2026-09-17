"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoHorizontal } from "@/components/ui/logo";

export default function AdminForgotPasswordPage() {
  const [mode, setMode] = useState<"email" | "pin">("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    email: string;
    message: string;
  } | null>(null);

  // Recovery PIN mode state
  const [recoveryPin, setRecoveryPin] = useState("");
  const [newIdentifier, setNewIdentifier] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pinSuccess, setPinSuccess] = useState(false);

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset link. Please verify your email.");
        setLoading(false);
        return;
      }

      setSuccessResult({
        email: data.email,
        message: data.message,
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePinReset(e: React.FormEvent) {
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
        setError(data.error || "Incorrect Master Recovery PIN.");
        setLoading(false);
        return;
      }

      setPinSuccess(true);
      setTimeout(() => {
        window.location.href = "/admin";
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
            Security & Account Recovery
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-lf-border/90 bg-lf-card/90 p-7 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-9">
          {/* Mode Switch Tabs */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl border border-lf-border bg-lf-surface/80 p-1">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode("email");
              }}
              className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                mode === "email"
                  ? "lf-gradient-bg text-white shadow-md shadow-lf-accent/20"
                  : "text-lf-muted hover:text-lf-ink"
              }`}
            >
              ✉️ Email Reset Link
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode("pin");
              }}
              className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                mode === "pin"
                  ? "lf-gradient-bg text-white shadow-md shadow-lf-accent/20"
                  : "text-lf-muted hover:text-lf-ink"
              }`}
            >
              🔑 Master PIN Reset
            </button>
          </div>

          {mode === "email" ? (
            <>
              {/* Instagram/Facebook Style Email Flow */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-lf-accent/10 text-lf-accent">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-lf-ink">Trouble Logging In?</h1>
                <p className="mt-1.5 text-xs text-lf-muted leading-relaxed">
                  Enter your registered admin email or username to generate a secure reset link.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-500 leading-relaxed">
                  <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {successResult ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center leading-relaxed">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-lf-ink mb-1">Check Your Email</h2>
                    <p className="text-xs text-lf-muted mb-3 leading-relaxed">
                      We have sent a secure password reset link to <br />
                      <strong className="text-lf-ink font-semibold text-sm">{successResult.email}</strong>
                    </p>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-lf-muted text-left space-y-1">
                      <p className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                        <span>✓</span> Open your email app and click the link to reset your password.
                      </p>
                      <p className="text-lf-muted/80">
                        • Valid for 30 minutes. If not in Primary inbox, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSuccessResult(null);
                      setEmail("");
                    }}
                    className="w-full text-center text-xs text-lf-muted hover:text-lf-ink underline pt-1"
                  >
                    Didn&apos;t receive it? Try another email address
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-lf-muted">
                      Admin Email or Username
                    </label>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hello.lazyflow@gmail.com"
                      className="w-full rounded-xl border border-lf-border bg-lf-surface px-4 py-3 text-sm text-lf-ink placeholder:text-lf-muted/50 focus:border-lf-accent focus:outline-none focus:ring-1 focus:ring-lf-accent transition-all"
                    />
                    <p className="mt-1 text-[11px] text-lf-muted">
                      Admin email: <code className="font-mono text-lf-ink">hello.lazyflow@gmail.com</code> (or enter <code className="font-mono text-lf-ink">admin</code>)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl lf-gradient-bg py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-lf-accent/25 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Generating Reset Link...
                      </>
                    ) : (
                      "Generate Reset Link"
                    )}
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              {/* Master Recovery PIN Mode */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-lf-ink">Instant PIN Reset</h1>
                <p className="mt-1.5 text-xs text-lf-muted">
                  Use your secret Master Recovery PIN to reset your credentials without waiting for an email.
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

              {pinSuccess && (
                <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 font-medium">
                  <span>✅ Credentials updated successfully! Redirecting to dashboard...</span>
                </div>
              )}

              <form onSubmit={handlePinReset} className="space-y-4">
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
                    Default key: <code className="font-mono text-lf-ink">892410</code>
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
                    placeholder="Leave blank to keep current"
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
                  disabled={loading || pinSuccess}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl lf-gradient-bg py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-lf-accent/25 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Updating Credentials...
                    </>
                  ) : (
                    "Reset & Sign In"
                  )}
                </button>
              </form>

              {/* Back to Email mode */}
              <div className="mt-6 border-t border-lf-border/70 pt-5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode("email");
                  }}
                  className="text-xs text-lf-muted hover:text-lf-accent transition-colors"
                >
                  ← Back to Email Reset Link
                </button>
              </div>
            </>
          )}
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
