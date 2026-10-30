"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";

export default function AdminLoginForm() {
  const [username, setUsername] = useState("Admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading || success) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Invalid username or password. Please try again.");
      }

      setSuccess("Authentication successful. Opening dashboard...");
      // Redirect to admin dashboard
      setTimeout(() => {
        window.location.href = "/admin";
      }, 500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid username or password. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F8F6F0] px-4 py-12 text-[#183D32] antialiased selection:bg-[#C8A45D]/30 selection:text-[#183D32]">
      {/* Ambient luxury background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-[#C8A45D]/15 blur-[120px]" />
        <div className="absolute -bottom-[20%] right-[10%] h-[450px] w-[450px] rounded-full bg-[#183D32]/10 blur-[140px]" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-8 shadow-[0_20px_50px_rgba(24,61,50,0.06)] backdrop-blur-xl sm:p-10">
        {/* Top subtle gold highlight */}
        <div className="absolute inset-x-8 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#C8A45D] to-transparent" />

        {/* Header with Tranquil Terrace branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-auto max-w-[220px] items-center justify-center rounded-xl border border-[#E5DFD3] bg-[#FAF8F5] px-4 py-2 shadow-sm">
            <img
              src="/assets/tranquil-terrace-logo.webp"
              alt="Tranquil Terrace Galle"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C8A45D]/40 bg-[#C8A45D]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#93712D]">
            Staff Portal
          </div>
          <h1 className="mt-4 font-serif text-2xl font-normal tracking-wide text-[#183D32] sm:text-3xl">
            Staff &amp; Management Portal
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-[#5A6660] sm:text-sm">
            Enter credentials to access live villa reservations, calendars and guest records.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 sm:text-sm"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <span className="flex-1 leading-normal">{error}</span>
          </div>
        )}

        {/* Success notification */}
        {success && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-xl border border-[#C8A45D]/50 bg-[#C8A45D]/15 p-4 text-xs text-[#183D32] sm:text-sm"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#93712D]" />
            <span className="flex-1 leading-normal">{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold uppercase tracking-wider text-[#183D32]"
            >
              Username
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#93712D]">
                <User size={16} />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin"
                required
                disabled={loading || Boolean(success)}
                className="w-full rounded-xl border border-[#DCD5C9] bg-[#FDFBF7] py-3 pl-10 pr-4 text-sm text-[#183D32] placeholder-[#9CA3AF] transition-colors focus:border-[#183D32] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#183D32] disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#183D32]"
              >
                Password
              </label>
            </div>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#93712D]">
                <Lock size={16} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading || Boolean(success)}
                className="w-full rounded-xl border border-[#DCD5C9] bg-[#FDFBF7] py-3 pl-10 pr-11 text-sm text-[#183D32] placeholder-[#9CA3AF] transition-colors focus:border-[#183D32] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#183D32] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#7A8882] transition-colors hover:text-[#183D32] focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || Boolean(success)}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#183D32] via-[#225244] to-[#183D32] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#183D32]/20 transition-all hover:brightness-105 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Authenticating...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span>Authenticated</span>
                </>
              ) : (
                <>
                  <span>Log In to Dashboard →</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer return link */}
        <div className="mt-8 border-t border-[#E5DFD3] pt-6 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#5A6660] transition-colors hover:text-[#183D32]"
          >
            <span>← Return to Tranquil Terrace website</span>
          </a>
        </div>
      </div>
    </div>
  );
}
