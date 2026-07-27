import Link from "next/link";
import Image from "next/image";
import { PROGRAMME_RULES } from "@/lib/constants";

export const metadata = {
  title: "Referral Programme",
};

export default function ProgrammePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/programme.png"
            alt="Referral network connections"
            fill
            priority
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/50" />
        </div>
        <div className="relative mx-auto max-w-[var(--max)] px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">
            Partner Programme
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Earn by connecting businesses with Webara Studio
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            We design and build websites and web applications for businesses across the UK.
            If you know businesses that need digital work, you can earn commission for every
            successful referral.
          </p>
        </div>
      </section>

      {/* Eligibility */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-[var(--max)] px-4 py-10 sm:px-6 sm:py-12">
          <h2 className="text-xl font-bold">Who can become a partner?</h2>
          <div className="mt-6 grid gap-4 sm:gap-6 md:grid-cols-3">
            {[
              { title: "Network Builders", desc: "You regularly meet business owners who need websites, apps, or digital tools." },
              { title: "Service Providers", desc: "You offer complementary services (marketing, accounting, consulting) and your clients often need web work." },
              { title: "Industry Connectors", desc: "You're active in business communities — chambers, networking groups, or online forums." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold text-gold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            We review every application individually. There is no open self-approval —
            we approve partners who can bring quality leads.
          </p>
        </div>
      </section>

      {/* Commission */}
      <section className="mx-auto max-w-[var(--max)] px-4 py-10 sm:px-6 sm:py-12">
        <h2 className="text-xl font-bold">Commission</h2>
        <p className="mt-2 text-sm text-muted">
          Fixed payouts per won and paid project. The amount is locked when the lead becomes eligible.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted">Website Projects</p>
            <p className="mt-2 text-3xl font-bold text-gold">
              ${PROGRAMME_RULES.commissionTiers.website.amount}
            </p>
            <p className="mt-1 text-xs text-muted">
              Business websites, landing pages, portfolios
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted">Web Application Projects</p>
            <p className="mt-2 text-3xl font-bold text-gold">
              ${PROGRAMME_RULES.commissionTiers.web_app.amount}
            </p>
            <p className="mt-1 text-xs text-muted">
              Custom platforms, booking systems, portals
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted">
          Commission becomes eligible only after the client completes payment for the project.
          Payouts are processed manually with a receipt provided.
        </p>
      </section>

      {/* Process */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-[var(--max)] px-4 py-10 sm:px-6 sm:py-12">
          <h2 className="text-xl font-bold">The Process</h2>
          <div className="mt-8 space-y-4">
            {[
              { step: "1", title: "Submit a Lead", desc: "Share the prospect's details — name, contact, what they need, and budget if known." },
              { step: "2", title: "We Review", desc: "Our team checks for duplicates and reviews the lead quality." },
              { step: "3", title: "We Contact", desc: "We reach out to the prospect and work them through qualification and proposal." },
              { step: "4", title: "Project Won", desc: "When the prospect accepts, the lead is marked as won. You'll see the status update in your portal." },
              { step: "5", title: "Client Pays", desc: "After the client completes payment, your commission becomes eligible." },
              { step: "6", title: "You Get Paid", desc: "We process the payout and provide a receipt. The rate is fixed at the time of eligibility." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-dark">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[var(--max)] px-4 py-12 sm:px-6 sm:py-16 text-center">
        <h2 className="text-2xl font-bold">Ready to apply?</h2>
        <p className="mt-2 text-muted">
          Tell us about yourself and your network. We&apos;ll review and get back to you.
        </p>
        <Link
          href="/referral-programme/apply"
          className="mt-8 inline-block rounded-lg bg-gold px-8 py-4 font-semibold text-dark transition hover:opacity-90"
        >
          Apply Now
        </Link>
      </section>
    </main>
  );
}
