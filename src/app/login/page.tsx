"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Mock auth — any email/password works
    // Use "admin" in email to get admin role
    await signIn(email, password);

    // Redirect based on role
    if (email.includes("admin")) {
      router.push("/admin");
    } else {
      router.push("/portal");
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center px-6">
      <div className="w-full">
        <h1 className="text-2xl font-bold">Partner Login</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in to access your referral portal.
        </p>

        {/* Demo notice */}
        <div className="mt-6 rounded-lg border border-info/30 bg-info/5 p-3 text-xs text-muted">
          <strong className="text-info">Demo Mode:</strong> Use any email/password to sign in.
          Include &quot;admin&quot; in the email for admin access.
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-cream outline-none transition focus:border-gold"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-cream outline-none transition focus:border-gold"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-gold py-3 font-semibold text-dark transition hover:opacity-90"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Not a partner yet?{" "}
          <a href="/referral-programme/apply" className="text-gold hover:underline">
            Apply here
          </a>
        </p>
      </div>
    </main>
  );
}
