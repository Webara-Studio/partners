"use client";

import { useAuth } from "@/lib/auth-context";

/**
 * Dev-only role switcher for testing both referrer and admin views.
 * Hidden in production.
 */
export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  if (!user) return null;

  return (
    <div className="border-t border-border bg-card/50 px-6 py-1">
      <div className="mx-auto flex max-w-[var(--max)] items-center justify-center gap-2 text-[0.65rem]">
        <span className="text-muted">Dev role:</span>
        <button
          onClick={() => switchRole("referrer")}
          className={`rounded px-2 py-0.5 font-medium ${
            user.role === "referrer" ? "bg-gold text-dark" : "text-muted hover:text-cream"
          }`}
        >
          Referrer
        </button>
        <button
          onClick={() => switchRole("admin")}
          className={`rounded px-2 py-0.5 font-medium ${
            user.role === "admin" ? "bg-gold text-dark" : "text-muted hover:text-cream"
          }`}
        >
          Admin
        </button>
      </div>
    </div>
  );
}
