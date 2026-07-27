"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PROGRAMME_RULES, BRAND } from "@/lib/constants";

/**
 * Referral landing route — /ref/[code]
 *
 * When a referrer shares their link, prospects land here.
 * The referral code is stored in a cookie (90 days) so when
 * the prospect eventually contacts Webara, the attribution
 * is preserved.
 */
export default function ReferralLandingPage() {
  const params = useParams();
  const code = params.code as string;
  const [cookieSet, setCookieSet] = useState(false);

  useEffect(() => {
    if (!code) return;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + PROGRAMME_RULES.cookieExpiryDays);
    document.cookie = `webara_ref=${code}; expires=${expiry.toUTCString()}; path=/; SameSite=Lax`;
    setCookieSet(true);
  }, [code]);

  return (
    <main className="mx-auto max-w-[var(--max)] px-6 py-16 text-center">
      {/* Referrer attribution banner */}
      <div className="mx-auto max-w-md rounded-xl border border-gold/30 bg-gold/5 p-4">
        <p className="text-sm text-cream">
          🎯 You were referred by{" "}
          <span className="font-bold text-gold">{code}</span>
        </p>
        <p className="mt-1 text-xs text-muted">
          We&apos;ll remember this when you get in touch.
        </p>
      </div>

      <h1 className="mt-12 text-4xl font-bold md:text-5xl">
        Let&apos;s build something{" "}
        <span className="text-gold">great</span> together
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
        Webara Studio designs and builds websites and web applications for businesses
        that want to stand out. AI-powered, conversion-ready, and built to grow.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a
          href={BRAND.url}
          className="rounded-lg bg-gold px-8 py-4 font-semibold text-dark transition hover:opacity-90"
        >
          View Our Work
        </a>
        <a
          href={`${BRAND.url}/#contact`}
          className="rounded-lg border border-border px-8 py-4 font-semibold text-cream transition hover:border-gold"
        >
          Start a Project
        </a>
      </div>

      {/* Trust indicators */}
      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {[
          { stat: "Since 2016", label: "Crafting digital experiences" },
          { stat: "AI-Powered", label: "Modern tech stack on every project" },
          { stat: "Flexible Terms", label: "Profit-share options available" },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-xl font-bold text-gold">{item.stat}</p>
            <p className="mt-1 text-sm text-muted">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Cookie confirmation */}
      {cookieSet && (
        <p className="mt-12 text-xs text-muted">
          ✓ Referral tracked. This attribution lasts {PROGRAMME_RULES.cookieExpiryDays} days.
        </p>
      )}
    </main>
  );
}
