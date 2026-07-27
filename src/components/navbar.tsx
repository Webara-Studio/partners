"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "./logo";
import Link from "next/link";

/**
 * Responsive top navigation bar.
 * Collapses to hamburger menu on mobile.
 */
export function Navbar() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = user ? (
    <>
      {/* Admin links — always shown for admins */}
      {user.role === "admin" && (
        <>
          <MobileLink href="/admin" onClick={() => setMobileOpen(false)}>Overview</MobileLink>
          <MobileLink href="/admin/leads" onClick={() => setMobileOpen(false)}>All Leads</MobileLink>
          <MobileLink href="/admin/referrers" onClick={() => setMobileOpen(false)}>Referrers</MobileLink>
        </>
      )}
      {/* Portal links — shown for referrers AND admins */}
      <MobileLink href="/portal" onClick={() => setMobileOpen(false)}>My Dashboard</MobileLink>
      <MobileLink href="/portal/submit" onClick={() => setMobileOpen(false)}>Submit Lead</MobileLink>
      <MobileLink href="/portal/leads" onClick={() => setMobileOpen(false)}>My Leads</MobileLink>
      <MobileLink href="/portal/leaderboard" onClick={() => setMobileOpen(false)}>Leaderboard</MobileLink>
      <MobileLink href="/portal/payouts" onClick={() => setMobileOpen(false)}>Payouts</MobileLink>
    </>
  ) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-nav backdrop-blur-md">
      <nav className="mx-auto flex max-w-[var(--max)] items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Logo size="md" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <nav className="flex items-center gap-4 text-sm">
                {user.role === "admin" && (
                  <>
                    <Link href="/admin" className="text-muted transition hover:text-gold">Overview</Link>
                    <Link href="/admin/leads" className="text-muted transition hover:text-gold">All Leads</Link>
                    <Link href="/admin/referrers" className="text-muted transition hover:text-gold">Referrers</Link>
                  </>
                )}
                <Link href="/portal" className="text-muted transition hover:text-gold">My Dashboard</Link>
                <Link href="/portal/submit" className="text-muted transition hover:text-gold">Submit Lead</Link>
                <Link href="/portal/leaderboard" className="text-muted transition hover:text-gold">Leaderboard</Link>
              </nav>

              <div className="flex items-center gap-3 border-l border-border pl-4">
                <span className="text-xs text-muted">{user.display_name}</span>
                <button onClick={signOut} className="text-xs text-danger transition hover:underline">
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

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center justify-center rounded-lg p-2 text-cream transition hover:bg-card md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-border bg-nav md:hidden">
          <div className="space-y-1 px-4 py-3">

            {user ? (
              <>
                {navLinks}
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted">{user.display_name}</span>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                    }}
                    className="text-xs text-danger transition hover:underline"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg border border-border px-4 py-2.5 text-center text-sm text-cream transition hover:border-gold"
                >
                  Login
                </Link>
                <Link
                  href="/referral-programme/apply"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg bg-gold px-4 py-2.5 text-center text-sm font-semibold text-dark transition hover:opacity-90"
                >
                  Become a Partner
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-lg px-3 py-2.5 text-sm text-cream transition hover:bg-card hover:text-gold"
    >
      {children}
    </Link>
  );
}
