"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoHorizontal } from "@/components/ui/logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Check if redirect query param exists
      const params = new URLSearchParams(window.location.search);
      const nextUrl = params.get("next") || "/admin";
      router.push(nextUrl);
      router.refresh();
    } catch {
      setError("Network error. Please check your connection.");
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
            Protected Admin Area
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-lf-border/90 bg-lf-card/90 p-7 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-9">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-lf-ink">Sign In</h1>
            <p className="mt-1.5 text-xs text-lf-muted">
              Enter your credentials to access the LazyFlow management console.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-lf-muted">
                Admin Email or ID
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="hello.lazyflow@gmail.com"
                autoComplete="username"
                className="w-full rounded-xl border border-lf-border bg-lf-surface px-4 py-3 text-sm text-lf-ink placeholder:text-lf-muted/50 focus:border-lf-accent focus:outline-none focus:ring-1 focus:ring-lf-accent transition-all"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-lf-muted">
                  Password
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-xs font-medium text-lf-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-lf-border bg-lf-surface px-4 py-3 pr-11 text-sm text-lf-ink placeholder:text-lf-muted/50 focus:border-lf-accent focus:outline-none focus:ring-1 focus:ring-lf-accent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-lf-muted hover:text-lf-ink transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl lf-gradient-bg py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-lf-accent/25 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Authenticating...
                </>
              ) : (
                "Sign In to Admin"
              )}
            </button>
          </form>

          {/* Quick Setup Hint */}
          <div className="mt-6 rounded-2xl border border-dashed border-lf-border bg-lf-surface/60 p-3.5 text-center text-xs text-lf-muted">
            Admin: <code className="text-lf-ink font-mono font-semibold">hello.lazyflow@gmail.com</code> (or <code className="text-lf-ink font-mono font-semibold">admin</code>) / <code className="text-lf-ink font-mono font-semibold">Admin@LazyFlow2026</code>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-medium text-lf-muted hover:text-lf-ink transition-colors"
          >
            ← Back to LazyFlow Website
          </Link>
        </div>
      </div>
    </div>
  );
}
