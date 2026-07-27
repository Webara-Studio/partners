"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/lib/use-require-auth";
import { checkDuplicate, submitLead } from "@/lib/api";
import { PROGRAMME_RULES } from "@/lib/constants";
import { LoadingSpinner } from "@/components/loading-spinner";
import { BackLink } from "@/components/ui";
import { FormField, TextInput, TextArea, SelectInput, FormCheckbox, SubmitButton } from "@/components/form-fields";
import type { ProjectType, LeadFormData } from "@/lib/types";

export default function SubmitLeadPage() {
  const { user } = useAuth();
  const loading = useRequireRole("referrer");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState<LeadFormData>({
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

  const set = <K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    if (!user) return;

    const isDup = await checkDuplicate(form.prospect_phone, form.prospect_email || undefined);
    if (isDup && !duplicateWarning) {
      setDuplicateWarning(true);
      setSubmitting(false);
      return;
    }

    const result = await submitLead(user.id, form);
    if ("error" in result) {
      setSubmitError(result.error);
      setSubmitting(false);
    } else {
      router.push("/portal");
    }
  };

  if (loading || !user) return <LoadingSpinner />;

  const tiers = PROGRAMME_RULES.commissionTiers;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <BackLink href="/portal">← Back</BackLink>

      <h1 className="mt-4 text-xl font-bold sm:text-2xl">Submit a Lead</h1>
      <p className="mt-2 text-sm text-muted">
        Share the prospect&apos;s details. The more information you provide, the faster we can act on it.
      </p>

      {duplicateWarning && (
        <div className="mt-6 rounded-lg border border-warning/40 bg-warning/10 p-4">
          <p className="text-sm font-medium text-warning">⚠️ Possible duplicate detected</p>
          <p className="mt-1 text-xs text-muted">
            A lead with a similar phone number may already exist. Our team will review this submission manually.
          </p>
          <button onClick={() => setDuplicateWarning(false)} className="mt-3 text-xs text-gold hover:underline">
            I understand — submit anyway
          </button>
        </div>
      )}

      {submitError && (
        <div className="mt-6 rounded-lg border border-danger/40 bg-danger/10 p-4">
          <p className="text-sm font-medium text-danger">Error submitting lead</p>
          <p className="mt-1 text-xs text-muted">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="rounded-xl border border-border bg-card/50 p-4 sm:p-5">
          <h3 className="mb-4 text-sm font-semibold text-gold">Prospect Details</h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Prospect Name" required>
                <TextInput value={form.prospect_name} onChange={(v) => set("prospect_name", v)} placeholder="John Smith" required />
              </FormField>
              <FormField label="Phone / WhatsApp" required>
                <TextInput type="tel" value={form.prospect_phone} onChange={(v) => set("prospect_phone", v)} placeholder="+44 7700 900123" required />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Email" hint="Optional">
                <TextInput type="email" value={form.prospect_email} onChange={(v) => set("prospect_email", v)} placeholder="john@business.com" />
              </FormField>
              <FormField label="Business / Project Name" hint="Optional">
                <TextInput value={form.business_name} onChange={(v) => set("business_name", v)} placeholder="Acme Ltd" />
              </FormField>
            </div>
            <FormField label="Location" required>
              <TextInput value={form.prospect_location} onChange={(v) => set("prospect_location", v)} placeholder="City, Country" required />
            </FormField>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-4 sm:p-5">
          <h3 className="mb-4 text-sm font-semibold text-gold">Project Details</h3>
          <div className="space-y-4">
            <FormField label="Project Type" required>
              <SelectInput<ProjectType> value={form.project_type} onChange={(v) => set("project_type", v)}>
                <option value="website">Website (£{tiers.website.amount} commission)</option>
                <option value="web_app">Web Application (£{tiers.web_app.amount} commission)</option>
                <option value="other">Other / Not Sure</option>
              </SelectInput>
            </FormField>
            <FormField label="What do they need?" required>
              <TextInput value={form.service_interest} onChange={(v) => set("service_interest", v)} placeholder="Business website with booking system" required />
            </FormField>
            <FormField label="Budget" hint="Optional — if known">
              <TextInput value={form.budget} onChange={(v) => set("budget", v)} placeholder="£2,000-5,000" />
            </FormField>
            <FormField label="Description" required>
              <TextArea value={form.description} onChange={(v) => set("description", v)} placeholder="Plumber needing a professional website with online booking..." required />
            </FormField>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-4 sm:p-5">
          <FormField label="Additional Notes" hint="Optional">
            <TextArea value={form.note} onChange={(v) => set("note", v)} rows={2} placeholder="Met at a networking event, very interested..." />
          </FormField>
          <div className="mt-4">
            <FormCheckbox checked={form.consent} onChange={(v) => set("consent", v)}>
              I confirm that I have the prospect&apos;s permission to share their details with Webara Studio for the purpose of a business enquiry.
            </FormCheckbox>
          </div>
        </div>

        <SubmitButton loading={submitting}>Submit Lead</SubmitButton>
      </form>
    </main>
  );
}
