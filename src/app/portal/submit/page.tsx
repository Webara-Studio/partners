"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/lib/use-require-auth";
import type { ProjectType } from "@/lib/types";

export default function SubmitLeadPage() {
  const { user } = useAuth();
  const loading = useRequireRole("referrer");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  const [form, setForm] = useState({
    prospect_name: "",
    prospect_phone: "",
    prospect_email: "",
    business_name: "",
    project_type: "website" as ProjectType,
    service_interest: "",
    prospect_location: "",
    budget: "",
    description: "",
    consent: false,
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Mock duplicate detection
    if (form.prospect_phone.includes("999")) {
      setDuplicateWarning(true);
      setSubmitting(false);
      return;
    }

    // Mock submit — in production this would be a Supabase insert
    await new Promise((r) => setTimeout(r, 800));
    router.push("/portal");
  };

  if (loading || !user) return <LoadingSpinner />;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <button
        onClick={() => router.back()}
        className="text-sm text-muted transition hover:text-gold"
      >
        ← Back
      </button>

      <h1 className="mt-4 text-2xl font-bold">Submit a Lead</h1>
      <p className="mt-2 text-sm text-muted">
        Share the prospect&apos;s details. The more information you provide, the faster we can act on it.
      </p>

      {/* Duplicate warning */}
      {duplicateWarning && (
        <div className="mt-6 rounded-lg border border-warning/40 bg-warning/10 p-4">
          <p className="text-sm font-medium text-warning">⚠️ Possible duplicate detected</p>
          <p className="mt-1 text-xs text-muted">
            A lead with a similar phone number may already exist in our system. Our team will
            review this submission manually. No other referrer&apos;s details are shown.
          </p>
          <button
            onClick={() => setDuplicateWarning(false)}
            className="mt-3 text-xs text-gold hover:underline"
          >
            I understand — submit anyway
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Prospect Details */}
        <div className="rounded-xl border border-border bg-card/50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gold">Prospect Details</h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prospect Name" required>
                <input
                  type="text"
                  required
                  value={form.prospect_name}
                  onChange={(e) => setForm({ ...form, prospect_name: e.target.value })}
                  className="input"
                  placeholder="John Smith"
                />
              </Field>
              <Field label="Phone / WhatsApp" required>
                <input
                  type="tel"
                  required
                  value={form.prospect_phone}
                  onChange={(e) => setForm({ ...form, prospect_phone: e.target.value })}
                  className="input"
                  placeholder="+44 7700 900123"
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" hint="Optional">
                <input
                  type="email"
                  value={form.prospect_email}
                  onChange={(e) => setForm({ ...form, prospect_email: e.target.value })}
                  className="input"
                  placeholder="john@business.com"
                />
              </Field>
              <Field label="Business / Project Name" hint="Optional">
                <input
                  type="text"
                  value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                  className="input"
                  placeholder="Acme Ltd"
                />
              </Field>
            </div>
            <Field label="Location" required>
              <input
                type="text"
                required
                value={form.prospect_location}
                onChange={(e) => setForm({ ...form, prospect_location: e.target.value })}
                className="input"
                placeholder="City, Country"
              />
            </Field>
          </div>
        </div>

        {/* Project Details */}
        <div className="rounded-xl border border-border bg-card/50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gold">Project Details</h3>
          <div className="space-y-4">
            <Field label="Project Type" required>
              <select
                value={form.project_type}
                onChange={(e) => setForm({ ...form, project_type: e.target.value as ProjectType })}
                className="input"
              >
                <option value="website">Website (£150 commission)</option>
                <option value="web_app">Web Application (£300 commission)</option>
                <option value="other">Other / Not Sure</option>
              </select>
            </Field>
            <Field label="What do they need?" required>
              <input
                type="text"
                required
                value={form.service_interest}
                onChange={(e) => setForm({ ...form, service_interest: e.target.value })}
                className="input"
                placeholder="Business website with booking system"
              />
            </Field>
            <Field label="Budget" hint="Optional — if known">
              <input
                type="text"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="input"
                placeholder="£2,000-5,000"
              />
            </Field>
            <Field label="Description" required>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input resize-none"
                placeholder="Plumber needing a professional website with online booking..."
              />
            </Field>
          </div>
        </div>

        {/* Notes & Consent */}
        <div className="rounded-xl border border-border bg-card/50 p-5">
          <Field label="Additional Notes" hint="Optional">
            <textarea
              rows={2}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="input resize-none"
              placeholder="Met at a networking event, very interested..."
            />
          </Field>
          <label className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              required
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              className="mt-1 h-4 w-4 accent-gold"
            />
            <span className="text-xs text-muted">
              I confirm that I have the prospect&apos;s permission to share their details
              with Webara Studio for the purpose of a business enquiry.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gold py-4 font-semibold text-dark transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Lead"}
        </button>
      </form>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background-color: var(--color-card);
          padding: 10px 14px;
          color: var(--color-cream);
          font-size: 0.9rem;
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

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
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

function LoadingSpinner() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </main>
  );
}
