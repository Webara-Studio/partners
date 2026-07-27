"use client";

import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/lib/use-require-auth";
import { useAsync } from "@/lib/use-async";
import { getCommissionsForReferrer, getPayoutsForReferrer, getLead } from "@/lib/api";
import { COMMISSION_STATUS_CONFIG, PAYOUT_STATUS_CONFIG } from "@/lib/constants";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PageHeader, EmptyState } from "@/components/ui";
import type { Commission } from "@/lib/types";

export default function PayoutsPage() {
  const { user } = useAuth();
  const loading = useRequireRole("referrer");

  const { data: commissions } = useAsync(
    () => (user ? getCommissionsForReferrer(user.id) : Promise.resolve([])),
    [user?.id]
  );
  const { data: payouts } = useAsync(
    () => (user ? getPayoutsForReferrer(user.id) : Promise.resolve([])),
    [user?.id]
  );

  if (loading || !user) return <LoadingSpinner />;

  const resolvedCommissions = commissions || [];
  const resolvedPayouts = payouts || [];

  const totalPaid = resolvedPayouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingAmount = resolvedCommissions
    .filter((c) => ["pending_review", "approved", "scheduled"].includes(c.status))
    .reduce((s, c) => s + c.fixed_amount, 0);

  return (
    <main className="mx-auto max-w-[var(--max)] px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader title="Payouts" subtitle="Your commission and payout history." />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Total Paid</p>
          <p className="mt-2 text-3xl font-bold text-success">£{totalPaid}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Pending</p>
          <p className="mt-2 text-3xl font-bold text-warning">£{pendingAmount}</p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Commissions</h2>
        <div className="mt-3 space-y-2">
          {resolvedCommissions.length === 0 ? (
            <EmptyState message="No commissions yet. They appear after a project is won and paid." />
          ) : (
            resolvedCommissions.map((comm) => (
              <CommissionRow key={comm.id} comm={comm} />
            ))
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Payout History</h2>
        <div className="mt-3 space-y-2">
          {resolvedPayouts.length === 0 ? (
            <EmptyState message="No payouts yet." />
          ) : (
            resolvedPayouts.map((payout) => (
              <div key={payout.id} className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">£{payout.amount} {payout.currency}</p>
                    <p className="text-xs text-muted">
                      {payout.method.replace("_", " ")} ·{" "}
                      {payout.paid_at
                        ? new Date(payout.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : "Pending"}
                    </p>
                  </div>
                  <span className="text-sm font-medium" style={{ color: PAYOUT_STATUS_CONFIG[payout.status].color }}>
                    {PAYOUT_STATUS_CONFIG[payout.status].label}
                  </span>
                </div>
                {payout.receipt_label && (
                  <p className="mt-2 border-t border-border pt-2 text-xs text-muted">
                    Receipt: {payout.receipt_label}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function CommissionRow({ comm }: { comm: Commission }) {
  const { data: lead } = useAsync(() => getLead(comm.lead_id), [comm.lead_id]);
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
      <div>
        <p className="font-medium">{lead?.prospect_name || "Unknown"}</p>
        <p className="text-xs text-muted">
          {comm.fixed_amount} {comm.currency} · Rule v{comm.rule_version}
        </p>
      </div>
      <span className="text-sm font-medium" style={{ color: COMMISSION_STATUS_CONFIG[comm.status].color }}>
        {COMMISSION_STATUS_CONFIG[comm.status].label}
      </span>
    </div>
  );
}
