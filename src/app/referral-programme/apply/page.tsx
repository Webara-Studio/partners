"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND, PROGRAMME_RULES } from "@/lib/constants";

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    network_description: "",
    how_did_you_hear: "",
    consent: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission — no real backend yet
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="mx-auto max-w-[var(--max)] px-6 py-20">
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
          <div className="text-5xl">✅</div>
          <h1 className="mt-4 text-2xl font-bold text-gold">Application Received</h1>
          <p className="mt-3 text-sm text-muted">
            Thanks, {form.full_name.split(" ")[0] || "there"}! We&apos;ve received your
            application and will review it within 2–3 business days.
          </p>
          <p className="mt-2 text-xs text-muted">
            If approved, you&apos;ll receive an email with instructions to activate your
            partner account and get your referral code.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-lg border border-border px-6 py-3 text-sm font-medium text-cream transition hover:border-gold"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[var(--max)] px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/referral-programme"
          className="text-sm text-muted transition hover:text-gold"
        >
          ← Back to Programme
        </Link>

        <h1 className="mt-4 text-3xl font-bold">Partner Application</h1>
        <p className="mt-2 text-sm text-muted">
          Tell us about yourself and your network. We review every application individually.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Personal Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" required>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone / WhatsApp" required>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+44 7700 900123"
                className="input"
              />
            </Field>
            <Field label="Location" required>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City, Country"
                className="input"
              />
            </Field>
          </div>

          {/* Network */}
          <Field label="Describe your network" required hint="What kind of businesses do you connect with? How do you meet them?">
            <textarea
              required
              rows={4}
              value={form.network_description}
              onChange={(e) => setForm({ ...form, network_description: e.target.value })}
              className="input resize-none"
              placeholder="I'm a business consultant working with SMEs in the Manchester area..."
            />
          </Field>

          <Field label="How did you hear about us?" hint="Optional">
            <input
              type="text"
              value={form.how_did_you_hear}
              onChange={(e) => setForm({ ...form, how_did_you_hear: e.target.value })}
              className="input"
            />
          </Field>

          {/* Consent */}
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              required
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              className="mt-1 h-4 w-4 accent-gold"
            />
            <span className="text-xs text-muted">
              I agree to the programme terms and confirm that any leads I submit will be
              shared with the prospect&apos;s knowledge and consent. I understand that
              commission is payable only after a referred project is won and the client
              has completed payment. Fixed commission: £{PROGRAMME_RULES.commissionTiers.website.amount}{" "}
              (website) / £{PROGRAMME_RULES.commissionTiers.web_app.amount} (web app).
            </span>
          </label>

          <button
            type="submit"
            className="w-full rounded-lg bg-gold py-4 font-semibold text-dark transition hover:opacity-90"
          >
            Submit Application
          </button>
        </form>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background-color: var(--color-card);
          padding: 12px 16px;
          color: var(--color-cream);
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }
        :global(.input:focus) {
          border-color: var(--color-gold);
        }
        :global(.input::placeholder) {
          color: var(--color-muted);
          opacity: 0.5;
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-cream">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
