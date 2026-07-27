import Link from "next/link";
import { BRAND, PROGRAMME_RULES } from "@/lib/constants";

export default function LandingPage() {
  const tiers = PROGRAMME_RULES.commissionTiers;

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-[var(--max)] px-6 py-20 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold">
          Partner Programme
        </p>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">
          Refer businesses.
          <br />
          <span className="text-gold">Earn commission.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Know a business that needs a website or web app? Send them our way and earn
          a fixed commission on every project that&apos;s won and paid.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/referral-programme/apply"
            className="rounded-lg bg-gold px-8 py-4 font-semibold text-dark transition hover:opacity-90"
          >
            Become a Partner
          </Link>
          <Link
            href="/portal"
            className="rounded-lg border border-border px-8 py-4 font-semibold text-cream transition hover:border-gold"
          >
            Partner Login
          </Link>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-[var(--max)] px-6 py-16">
          <h2 className="text-center text-2xl font-bold">Commission Structure</h2>
          <p className="mt-2 text-center text-sm text-muted">
            Fixed payouts. No tiers, no percentages, no ambiguity.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { label: "Website", amount: tiers.website.amount, currency: tiers.website.currency, desc: "Business websites, landing pages, portfolios" },
              { label: "Web Application", amount: tiers.web_app.amount, currency: tiers.web_app.currency, desc: "Custom platforms, booking systems, portals" },
              { label: "Other Projects", amount: tiers.other.amount, currency: tiers.other.currency, desc: "Assessed case-by-case" },
            ].map((tier) => (
              <div
                key={tier.label}
                className="rounded-xl border border-border bg-card p-6 text-center"
              >
                <p className="text-sm font-medium text-muted">{tier.label}</p>
                <p className="mt-4 text-4xl font-bold text-gold">
                  £{tier.amount}
                </p>
                <p className="mt-1 text-xs text-muted">{tier.currency} per won + paid project</p>
                <p className="mt-4 text-xs text-muted">{tier.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted">
            Commission is locked at the rate in effect when the lead becomes eligible.
            Future programme changes do not affect historical commissions.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-[var(--max)] px-6 py-16">
        <h2 className="text-center text-2xl font-bold">How It Works</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-4">
          {[
            { step: "1", title: "Submit a Lead", desc: "Share the prospect's details and project needs through the portal." },
            { step: "2", title: "We Work the Pipeline", desc: "Our team reviews, contacts, qualifies, and proposes to the prospect." },
            { step: "3", title: "Project Won", desc: "When the prospect signs and pays, the project is marked as won." },
            { step: "4", title: "Get Paid", desc: "Fixed commission is released after client payment clears. Manual payout with receipt." },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-bold text-dark">
                {item.step}
              </div>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-[var(--max)] px-6 py-16 text-center">
          <h2 className="text-2xl font-bold">Ready to start referring?</h2>
          <p className="mt-2 text-muted">
            Applications are reviewed individually. We approve partners who can bring quality leads.
          </p>
          <Link
            href="/referral-programme/apply"
            className="mt-8 inline-block rounded-lg bg-gold px-8 py-4 font-semibold text-dark transition hover:opacity-90"
          >
            Apply to Join
          </Link>
        </div>
      </section>
    </main>
  );
}
