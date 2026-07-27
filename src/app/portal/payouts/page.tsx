"use client";

import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/lib/use-require-auth";
import { getCommissionsForReferrer, getPayoutsForReferrer, getLead } from "@/lib/api";
import { COMMISSION_STATUS_CONFIG, PAYOUT_STATUS_CONFIG } from "@/lib/constants";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PageHeader, EmptyState } from "@/components/ui";

export default function PayoutsPage() {
  const { user } = useAuth();
  const loading = useRequireRole("referrer");

  if (loading || !user) return <LoadingSpinner />;

  const commissions = getCommissionsForReferrer(user.id);
  const payouts = getPayoutsForReferrer(user.id);

  const totalPaid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingAmount = commissions
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
          {commissions.length === 0 ? (
            <EmptyState message="No commissions yet. They appear after a project is won and paid." />
          ) : (
            commissions.map((comm) => {
              const lead = getLead(comm.lead_id);
              return (
                <div key={comm.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
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
            })
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Payout History</h2>
        <div className="mt-3 space-y-2">
          {payouts.length === 0 ? (
            <EmptyState message="No payouts yet." />
          ) : (
            payouts.map((payout) => (
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
