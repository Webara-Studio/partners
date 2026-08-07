"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireRole } from "@/lib/use-require-auth";
import { useAsync } from "@/lib/use-async";
import { getLeadsForReferrer, getCommissionsForReferrer, getPayoutsForReferrer } from "@/lib/api";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PageHeader, StatCard } from "@/components/ui";
import Image from "next/image";
import { LeadRow } from "@/components/status";
import Link from "next/link";

export default function PortalDashboard() {
  const { user } = useAuth();
  const { referrerProfile } = useAuth();
  const router = useRouter();
  const loading = useRequireRole("referrer");

  useEffect(() => {
    if (!loading && referrerProfile?.programme_status === "approved" && !referrerProfile.terms_accepted_at) {
      router.replace("/portal/onboarding");
    }
  }, [loading, referrerProfile, router]);

  const { data: leads } = useAsync(
    () => (user ? getLeadsForReferrer(user.id) : Promise.resolve([])),
    [user?.id]
  );
  const { data: commissions } = useAsync(
    () => (user ? getCommissionsForReferrer(user.id) : Promise.resolve([])),
    [user?.id]
  );
  const { data: payouts } = useAsync(
    () => (user ? getPayoutsForReferrer(user.id) : Promise.resolve([])),
    [user?.id]
  );

  if (loading || !user) return <LoadingSpinner />;

  const resolvedLeads = leads || [];
  const resolvedCommissions = commissions || [];
  const resolvedPayouts = payouts || [];

  const won = resolvedLeads.filter((l) => l.status === "won");
  const inProgress = resolvedLeads.filter(
    (l) => !["won", "rejected", "duplicate", "unqualified", "lost", "cancelled"].includes(l.status)
  );
  const totalEarned = resolvedPayouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingAmount = resolvedCommissions
    .filter((c) => ["pending_review", "approved", "scheduled"].includes(c.status))
    .reduce((s, c) => s + (c.fixed_amount ?? (c.basis_amount ?? 0) * ((c.percentage ?? 0) / 100)), 0);
  const pendingPayouts = resolvedCommissions.filter(
    (c) => c.status === "pending_review" || c.status === "approved"
  ).length;

  return (
    <main className="mx-auto max-w-[var(--max)] px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title={`Welcome, ${user.display_name.split(" ")[0]}`}
        subtitle="Your referral dashboard"
        action={
          <Link href="/portal/submit" className="rounded-lg bg-gold px-5 py-2.5 text-center text-sm font-semibold text-dark transition hover:opacity-90">
            + Submit Lead
          </Link>
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 sm:mt-8 lg:grid-cols-4">
        <StatCard label="Total Leads" value={resolvedLeads.length} color="text-info" />
        <StatCard label="In Progress" value={inProgress.length} color="text-warning" />
        <StatCard label="Won" value={won.length} color="text-success" />
        <StatCard label="Total Earned" value={`GHS ${totalEarned.toLocaleString()}`} color="text-gold" />
      </div>

      <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-muted">
        <p className="font-semibold text-gold">Your commission model</p>
        <p className="mt-1">GHS 2,500 for each qualifying basic website sale, plus 20% of eligible add-on services from clients you introduce.</p>
        <p className="mt-1 text-xs">Add-on commission continues for the lifetime of the referred client relationship, subject to the partner agreement.</p>
        {pendingAmount > 0 && <p className="mt-2 font-medium text-cream">Pending commission: GHS {pendingAmount.toLocaleString()}</p>}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Leads</h2>
          <Link href="/portal/leads" className="text-sm text-muted hover:text-gold">View all →</Link>
        </div>
        <div className="mt-4 space-y-2">
          {resolvedLeads.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Image
                src="/images/empty-state.png"
                alt="Your journey starts here"
                width={200}
                height={200}
                className="mb-4 opacity-80"
              />
              <p className="text-sm text-muted">No leads yet — your journey starts here.</p>
              <Link href="/portal/submit" className="mt-3 inline-block rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-dark transition hover:opacity-90">
                Submit your first lead
              </Link>
            </div>
          ) : (
            resolvedLeads.slice(0, 5).map((lead) => <LeadRow key={lead.id} lead={lead} basePath="/portal" />)
          )}
        </div>
      </div>

      {pendingPayouts > 0 && (
        <div className="mt-8 rounded-xl border border-gold/30 bg-gold/5 p-4">
          <p className="text-sm font-medium text-gold">
            💰 {pendingPayouts} commission{pendingPayouts > 1 ? "s" : ""} pending payout
          </p>
          <Link href="/portal/payouts" className="mt-1 block text-xs text-muted hover:text-gold">View payout details →</Link>
        </div>
      )}
    </main>
  );
}
