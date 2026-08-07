"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/lib/use-require-auth";
import { savePartnerOnboarding, PARTNER_TERMS_VERSION } from "@/lib/api";
import { FormCheckbox, FormField, SelectInput, SubmitButton, TextInput } from "@/components/form-fields";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PageHeader } from "@/components/ui";
import type { PayoutMethod } from "@/lib/types";

const payoutOptions = [
  { value: "momo", label: "Mobile Money (MoMo)" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "other", label: "Other — discuss with Webara" },
];

export default function PartnerOnboardingPage() {
  const authLoading = useRequireRole("referrer");
  const { user, referrerProfile, refreshProfile } = useAuth();
  const router = useRouter();
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("momo");
  const [accountName, setAccountName] = useState("");
  const [accountReference, setAccountReference] = useState("");
  const [country, setCountry] = useState("Ghana");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (authLoading || !user) return <LoadingSpinner />;
  const userId = user.id;

  if (!referrerProfile) {
    return (
      <main className="mx-auto max-w-[var(--max)] px-4 py-8 sm:px-6">
        <PageHeader title="Partner onboarding" subtitle="Your partner profile is being prepared." />
        <div className="mt-8 rounded-xl border border-warning/30 bg-warning/10 p-5 text-sm text-warning">
          Your account is authenticated, but the approved partner profile has not yet been provisioned. Please contact Webara if this persists.
        </div>
      </main>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!accepted) {
      setError("Please accept the partner terms before continuing.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await savePartnerOnboarding(userId, {
      payout_method: payoutMethod,
      payout_account_name: accountName,
      payout_account_reference: accountReference,
      payout_country: country,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    await refreshProfile();
    router.push("/portal");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader title="Complete your partner onboarding" subtitle={`Referral code: ${referrerProfile.referral_code}`} />
      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div>
          <h2 className="font-semibold text-cream">Accept the partner terms</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            You will earn GHS 2,500 for each qualifying basic website sale and 20% of eligible net add-on revenue collected from clients you introduce. Commission is subject to cleared payment, applicable refund periods, duplicate-lead rules, clawbacks and the current partner agreement.
          </p>
        </div>

        <FormCheckbox
          checked={accepted}
          onChange={setAccepted}
        >
          I accept the Webara partner terms ({PARTNER_TERMS_VERSION}) and confirm that I understand the commission and referral rules.
        </FormCheckbox>

        <div className="border-t border-border pt-6">
          <h2 className="font-semibold text-cream">Payout preference</h2>
          <p className="mt-2 text-sm text-muted">These details are stored in your protected partner profile. They can be reviewed before your first payout.</p>
        </div>

        <FormField label="Preferred payout method" required>
          <SelectInput value={payoutMethod} onChange={(value) => setPayoutMethod(value as PayoutMethod)}>
            {payoutOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </SelectInput>
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Account or wallet name" required>
            <TextInput value={accountName} onChange={setAccountName} placeholder="Name registered to the account" />
          </FormField>
          <FormField label={payoutMethod === "momo" ? "MoMo number" : "Account reference"} required>
            <TextInput value={accountReference} onChange={setAccountReference} placeholder={payoutMethod === "momo" ? "024 000 0000" : "Account number or reference"} />
          </FormField>
        </div>
        <FormField label="Payout country" required>
          <TextInput value={country} onChange={setCountry} placeholder="Ghana" />
        </FormField>

        {error && <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>}
        <SubmitButton loading={saving}>{saving ? "Saving onboarding..." : "Complete onboarding"}</SubmitButton>
      </form>
    </main>
  );
}
