"use client";

import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/lib/use-require-auth";
import { getCommissionsByReferrer, getPayoutsByReferrer, getLeadById } from "@/lib/mock-data";
import { COMMISSION_STATUS_CONFIG, PAYOUT_STATUS_CONFIG } from "@/lib/constants";

export default function PayoutsPage() {
  const { user } = useAuth();
  const loading = useRequireRole("referrer");

  if (loading || !user) return <LoadingSpinner />;

  const commissions = getCommissionsByReferrer(user.id);
  const payouts = getPayoutsByReferrer(user.id);

  const totalPaid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingAmount = commissions
    .filter((c) => c.status === "pending_review" || c.status === "approved" || c.status === "scheduled")
    .reduce((s, c) => s + c.fixed_amount, 0);

  return (
    <main className="mx-auto max-w-[var(--max)] px-6 py-8">
      <h1 className="text-2xl font-bold">Payouts</h1>
      <p className="mt-1 text-sm text-muted">Your commission and payout history.</p>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Total Paid</p>
          <p className="mt-2 text-3xl font-bold text-success">£{totalPaid}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Pending</p>
          <p className="mt-2 text-3xl font-bold text-warning">£{pendingAmount}</p>
        </div>
      </div>

      {/* Commissions */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Commissions</h2>
        <div className="mt-3 space-y-2">
          {commissions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
              No commissions yet. Commissions appear after a project is won and paid.
            </p>
          ) : (
            commissions.map((comm) => {
              const lead = getLeadById(comm.lead_id);
              return (
                <div
                  key={comm.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{lead?.prospect_name || "Unknown"}</p>
                    <p className="text-xs text-muted">
                      {comm.fixed_amount} {comm.currency} · Rule v{comm.rule_version}
                    </p>
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: COMMISSION_STATUS_CONFIG[comm.status].color }}
                  >
                    {COMMISSION_STATUS_CONFIG[comm.status].label}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Payout history */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Payout History</h2>
        <div className="mt-3 space-y-2">
          {payouts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
              No payouts yet.
            </p>
          ) : (
            payouts.map((payout) => (
              <div
                key={payout.id}
                className="rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">£{payout.amount} {payout.currency}</p>
                    <p className="text-xs text-muted">
                      {payout.method.replace("_", " ")} ·{" "}
                      {payout.paid_at ? new Date(payout.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Pending"}
                    </p>
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: PAYOUT_STATUS_CONFIG[payout.status].color }}
                  >
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
      </div>
    </main>
  );
}

function LoadingSpinner() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </main>
  );
}
