"use client";
import { useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, CheckCircle2, Loader2, XCircle } from "lucide-react";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setError(data.error ?? "Something went wrong");
      }
    });
  }

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <XCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h1 className="text-white text-lg font-bold">Invalid link</h1>
        <p className="text-white/40 text-sm">This reset link is missing a token.</p>
        <Link href="/forgot-password" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
        <h1 className="text-white text-lg font-bold">Password updated</h1>
        <p className="text-white/40 text-sm">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-white text-xl font-bold mb-1">Set new password</h1>
      <p className="text-white/40 text-sm mb-6">Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/60 text-sm mb-1.5">New password</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition"
            placeholder="Min. 8 characters"
          />
        </div>
        <div>
          <label className="block text-white/60 text-sm mb-1.5">Confirm password</label>
          <input
            name="confirm"
            type="password"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Update password
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={<div className="text-white/40 text-sm text-center">Loading…</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
