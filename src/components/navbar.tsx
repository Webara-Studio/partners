"use client";

import { useAuth } from "@/lib/auth-context";
import { Logo } from "./logo";
import { PrototypeBadge } from "./prototype-badge";
import { RoleSwitcher } from "./role-switcher";
import Link from "next/link";

/**
 * Top navigation bar.
 * Shows different links based on auth state and role.
 */
export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-nav backdrop-blur-md">
      <nav className="mx-auto flex max-w-[var(--max)] items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo size="md" />
        </Link>

        <div className="flex items-center gap-4">
          {IS_MOCK && <PrototypeBadge />}

          {user ? (
            <>
              <nav className="flex items-center gap-4 text-sm">
                {user.role === "referrer" && (
                  <>
                    <Link href="/portal" className="text-muted transition hover:text-gold">
                      Dashboard
                    </Link>
                    <Link href="/portal/submit" className="text-muted transition hover:text-gold">
                      Submit Lead
                    </Link>
                    <Link href="/portal/leaderboard" className="text-muted transition hover:text-gold">
                      Leaderboard
                    </Link>
                  </>
                )}
                {user.role === "admin" && (
                  <>
                    <Link href="/admin" className="text-muted transition hover:text-gold">
                      Overview
                    </Link>
                    <Link href="/admin/leads" className="text-muted transition hover:text-gold">
                      Leads
                    </Link>
                    <Link href="/admin/referrers" className="text-muted transition hover:text-gold">
                      Referrers
                    </Link>
                  </>
                )}
              </nav>

              <div className="flex items-center gap-3 border-l border-border pl-4">
                <span className="text-xs text-muted">{user.display_name}</span>
                <button
                  onClick={signOut}
                  className="text-xs text-danger transition hover:underline"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted transition hover:text-gold">
                Login
              </Link>
              <Link
                href="/referral-programme/apply"
                className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-dark transition hover:opacity-90"
              >
                Become a Partner
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mock role switcher — dev only */}
      {IS_MOCK && user && <RoleSwitcher />}
    </header>
  );
}

import { IS_MOCK } from "@/lib/auth-context";
