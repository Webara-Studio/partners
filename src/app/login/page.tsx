"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { signIn, signUp, user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "referrer") router.replace("/portal");
  }, [router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(email, password, displayName || undefined);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Redirect based on role — the auth context will set the user
    // For new signups, user starts as "pending" role
    router.push("/portal");
  };

  return (
    <main className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-4 py-8">
      <div className="absolute inset-0">
        <Image
          src="/images/login-bg.png"
          alt=""
          fill
          className="object-cover opacity-15"
          sizes="100vw"
        />
      </div>
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-md sm:p-8">
        <h1 className="text-2xl font-bold">
          {mode === "signin" ? "Partner Login" : "Create Account"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {mode === "signin"
            ? "Sign in to access your referral portal."
            : "Create an account after your partner application has been approved."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
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
              className="input"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gold py-3 font-semibold text-dark transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {mode === "signin" ? (
            <>
              New here?{" "}
              <button onClick={() => setMode("signup")} className="text-gold hover:underline">
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("signin")} className="text-gold hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>

        <p className="mt-4 text-center text-sm text-muted">
          Not a partner yet?{" "}
          <Link href="/referral-programme/apply" className="text-gold hover:underline">
            Apply to become a partner
          </Link>
        </p>
        </div>
      </div>
    </main>
  );
}
