"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Zap, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong");
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">SocialHub</span>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8">
          {done ? (
            <div className="text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h1 className="text-white text-lg font-bold">Check your email</h1>
              <p className="text-white/40 text-sm">
                If an account exists for that address, you&apos;ll receive a reset link within a minute.
              </p>
              <Link href="/login" className="inline-flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm font-medium mt-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-white text-xl font-bold mb-1">Forgot password?</h1>
              <p className="text-white/40 text-sm mb-6">Enter your email and we&apos;ll send a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition"
                    placeholder="you@example.com"
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Send reset link
                </button>
              </form>

              <p className="text-center text-white/30 text-sm mt-6">
                <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
