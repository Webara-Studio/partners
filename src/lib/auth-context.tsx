"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Profile, ReferrerProfile, Session } from "./types";
import { getMockSession, IS_MOCK } from "./mock-data";

// ─── Context ─────────────────────────────────────────────

type AuthContextValue = {
  user: Profile | null;
  referrerProfile: ReferrerProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  /** Switch to admin view (mock only) */
  switchRole: (role: "referrer" | "admin") => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    const stored = localStorage.getItem("webara-partners-mock-role");
    const role = (stored as "referrer" | "admin") || "referrer";
    setSession(getMockSession(role));
    setLoading(false);
  }, []);

  const signIn = async (email: string) => {
    // Mock: determine role from email
    const isAdmin = email.includes("admin");
    const role = isAdmin ? "admin" : "referrer";
    localStorage.setItem("webara-partners-mock-role", role);
    setSession(getMockSession(role));
  };

  const signOut = () => {
    localStorage.removeItem("webara-partners-mock-role");
    setSession(null);
  };

  const switchRole = (role: "referrer" | "admin") => {
    localStorage.setItem("webara-partners-mock-role", role);
    setSession(getMockSession(role));
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        referrerProfile: session?.referrerProfile || null,
        loading,
        signIn,
        signOut,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { IS_MOCK };
