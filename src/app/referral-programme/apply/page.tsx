"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { submitPartnerApplication } from "@/lib/api";
import { BackLink } from "@/components/ui";
import { FormField, TextInput, TextArea, SelectInput, FormCheckbox, SubmitButton } from "@/components/form-fields";

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    profession: "",
    partner_type: "salesperson",
    sectors: "",
    network_description: "",
    estimated_monthly_referrals: "",
    referral_method: "",
    how_did_you_hear: "",
    consent: false,
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await submitPartnerApplication({
      ...form,
      profession: form.profession || null,
      partner_type: form.partner_type || null,
      sectors: form.sectors || null,
      estimated_monthly_referrals: form.estimated_monthly_referrals || null,
      referral_method: form.referral_method || null,
      how_did_you_hear: form.how_did_you_hear || null,
    });
    setSubmitting(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
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
            If approved, create an account using this same email address to activate your partner portal access.
          </p>
          <Link href="/" className="mt-8 inline-block rounded-lg border border-border px-6 py-3 text-sm font-medium text-cream transition hover:border-gold">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }


  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <BackLink href="/referral-programme">← Back to Programme</BackLink>

      <div className="relative mt-4 overflow-hidden rounded-xl">
        <Image
          src="/images/apply.png"
          alt="Earn commission through referrals"
          width={800}
          height={300}
          className="h-32 w-full object-cover sm:h-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
      </div>

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

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Profession or business" required>
            <TextInput value={form.profession} onChange={(v) => set("profession", v)} placeholder="Sales consultant, accountant, agency owner..." required />
          </FormField>
          <FormField label="Partner type" required>
            <SelectInput value={form.partner_type} onChange={(v) => set("partner_type", v)}>
              <option value="salesperson">Salesperson</option>
              <option value="business_consultant">Business consultant</option>
              <option value="marketing_professional">Marketing professional</option>
              <option value="accountant_adviser">Accountant or adviser</option>
              <option value="community_leader">Community or network leader</option>
              <option value="other">Other</option>
            </SelectInput>
          </FormField>
        </div>

        <FormField label="Strongest sectors or business communities" required hint="For example: property, hospitality, retail, professional services or diaspora businesses.">
          <TextInput value={form.sectors} onChange={(v) => set("sectors", v)} required />
        </FormField>

        <FormField label="Describe your network" required hint="What kind of businesses do you connect with? How do you meet them?">
          <TextArea value={form.network_description} onChange={(v) => set("network_description", v)} rows={4} required placeholder="I'm a business consultant working with SMEs in the Manchester area..." />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Expected suitable referrals per month" required>
            <SelectInput value={form.estimated_monthly_referrals} onChange={(v) => set("estimated_monthly_referrals", v)}>
              <option value="">Select an estimate</option>
              <option value="1-2">1–2</option>
              <option value="3-5">3–5</option>
              <option value="6-10">6–10</option>
              <option value="10+">10+</option>
            </SelectInput>
          </FormField>
          <FormField label="How will you generate referrals?" required hint="Existing clients, networking, outreach, social audience, partnerships, etc.">
            <TextInput value={form.referral_method} onChange={(v) => set("referral_method", v)} required />
          </FormField>
        </div>

        <FormField label="How did you hear about us?" hint="Optional">
          <TextInput value={form.how_did_you_hear} onChange={(v) => set("how_did_you_hear", v)} />
        </FormField>

        <FormCheckbox checked={form.consent} onChange={(v) => set("consent", v)}>
          I agree to the programme terms and confirm that any leads I submit will be shared with the prospect&apos;s knowledge and consent.
          I understand that applications require approval, and that commission is payable only after a referred project is won and the client has completed payment.
          The current programme offers GHS 2,500 for a qualifying basic website sale and 20% of eligible add-on services from clients I introduce.
        </FormCheckbox>

        {error && <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>}

        <SubmitButton loading={submitting}>Submit Application</SubmitButton>
      </form>
    </main>
  );
}
