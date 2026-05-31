"use client";
import { useTransition, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name     = fd.get("name") as string;
    const email    = fd.get("email") as string;
    const password = fd.get("password") as string;
    const confirm  = fd.get("confirm") as string;

    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters"); return; }

    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed"); return; }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) { setError("Account created but sign-in failed — try logging in"); return; }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">SocialHub</span>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8">
          <h1 className="text-white text-xl font-bold mb-1">Create an account</h1>
          <p className="text-white/40 text-sm mb-6">Start managing all your social media in one place</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-1.5">Full name</label>
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition"
                placeholder="Jane Smith"
              />
            </div>

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

            <div>
              <label className="block text-white/60 text-sm mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
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
                autoComplete="new-password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20"
            >
              {pending ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-white/40 text-sm text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
