"use client";

import { useState } from "react";
import Link from "next/link";
import { PROGRAMME_RULES } from "@/lib/constants";
import { BackLink } from "@/components/ui";
import { FormField, TextInput, TextArea, FormCheckbox, SubmitButton } from "@/components/form-fields";

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

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="mx-auto max-w-[var(--max)] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
          <div className="text-5xl">✅</div>
          <h1 className="mt-4 text-2xl font-bold text-gold">Application Received</h1>
          <p className="mt-3 text-sm text-muted">
            Thanks, {form.full_name.split(" ")[0] || "there"}! We&apos;ve received your application and will review it within 2–3 business days.
          </p>
          <p className="mt-2 text-xs text-muted">
            If approved, you&apos;ll receive an email with instructions to activate your partner account.
          </p>
          <Link href="/" className="mt-8 inline-block rounded-lg border border-border px-6 py-3 text-sm font-medium text-cream transition hover:border-gold">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const tiers = PROGRAMME_RULES.commissionTiers;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <BackLink href="/referral-programme">← Back to Programme</BackLink>

      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Partner Application</h1>
      <p className="mt-2 text-sm text-muted">Tell us about yourself and your network. We review every application individually.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full Name" required>
            <TextInput value={form.full_name} onChange={(v) => set("full_name", v)} required />
          </FormField>
          <FormField label="Email" required>
            <TextInput type="email" value={form.email} onChange={(v) => set("email", v)} required />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone / WhatsApp" required>
            <TextInput type="tel" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+44 7700 900123" required />
          </FormField>
          <FormField label="Location" required>
            <TextInput value={form.location} onChange={(v) => set("location", v)} placeholder="City, Country" required />
          </FormField>
        </div>

        <FormField label="Describe your network" required hint="What kind of businesses do you connect with? How do you meet them?">
          <TextArea value={form.network_description} onChange={(v) => set("network_description", v)} rows={4} required placeholder="I'm a business consultant working with SMEs in the Manchester area..." />
        </FormField>

        <FormField label="How did you hear about us?" hint="Optional">
          <TextInput value={form.how_did_you_hear} onChange={(v) => set("how_did_you_hear", v)} />
        </FormField>

        <FormCheckbox checked={form.consent} onChange={(v) => set("consent", v)}>
          I agree to the programme terms and confirm that any leads I submit will be shared with the prospect&apos;s knowledge and consent.
          I understand that commission is payable only after a referred project is won and the client has completed payment.
          Fixed commission: £{tiers.website.amount} (website) / £{tiers.web_app.amount} (web app).
        </FormCheckbox>

        <SubmitButton>Submit Application</SubmitButton>
      </form>
    </main>
  );
}
