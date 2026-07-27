"use client";

import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/lib/use-require-auth";
import { useAsync } from "@/lib/use-async";
import { getLeadsForReferrer, getCommissionsForReferrer, getPayoutsForReferrer } from "@/lib/api";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PageHeader, StatCard, EmptyState } from "@/components/ui";
import { LeadRow } from "@/components/status";
import Link from "next/link";

export default function PortalDashboard() {
  const { user } = useAuth();
  const loading = useRequireRole("referrer");

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
        <StatCard label="Total Earned" value={`$${totalEarned}`} color="text-gold" />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Leads</h2>
          <Link href="/portal/leads" className="text-sm text-muted hover:text-gold">View all →</Link>
        </div>
        <div className="mt-4 space-y-2">
          {resolvedLeads.length === 0 ? (
            <EmptyState
              message="No leads yet."
              action={<Link href="/portal/submit" className="mt-2 inline-block text-sm text-gold hover:underline">Submit your first lead →</Link>}
            />
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
