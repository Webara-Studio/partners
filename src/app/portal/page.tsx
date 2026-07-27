"use client";

import { useAuth, IS_MOCK } from "@/lib/auth-context";
import { useRequireRole } from "@/lib/use-require-auth";
import {
  getLeadsByReferrer,
  getCommissionsByReferrer,
  getPayoutsByReferrer,
} from "@/lib/mock-data";
import { LEAD_STATUS_CONFIG } from "@/lib/constants";
import Link from "next/link";
import { StatusBadge } from "@/components/status";

export default function PortalDashboard() {
  const { user } = useAuth();
  const loading = useRequireRole("referrer");

  if (loading || !user) return <LoadingScreen />;

  const leads = getLeadsByReferrer(user.id);
  const commissions = getCommissionsByReferrer(user.id);
  const payouts = getPayoutsByReferrer(user.id);

  const won = leads.filter((l) => l.status === "won");
  const inProgress = leads.filter((l) => !["won", "rejected", "duplicate", "unqualified", "lost", "cancelled"].includes(l.status));
  const totalEarned = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingPayouts = commissions.filter((c) => c.status === "pending_review" || c.status === "approved").length;

  return (
    <main className="mx-auto max-w-[var(--max)] px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Welcome, {user.display_name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted">Your referral dashboard</p>
        </div>
        <Link
          href="/portal/submit"
          className="rounded-lg bg-gold px-5 py-2.5 text-center text-sm font-semibold text-dark transition hover:opacity-90"
        >
          + Submit Lead
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 sm:mt-8 lg:grid-cols-4">
        <StatCard label="Total Leads" value={leads.length} color="text-info" />
        <StatCard label="In Progress" value={inProgress.length} color="text-warning" />
        <StatCard label="Won" value={won.length} color="text-success" />
        <StatCard label="Total Earned" value={`£${totalEarned}`} color="text-gold" />
      </div>

      {/* Recent leads */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Leads</h2>
          <Link href="/portal/leads" className="text-sm text-muted hover:text-gold">
            View all →
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {leads.length === 0 ? (
            <EmptyState />
          ) : (
            leads.slice(0, 5).map((lead) => (
              <Link
                key={lead.id}
                href={`/portal/leads/${lead.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition hover:border-gold/50"
              >
                <div>
                  <p className="font-medium">{lead.prospect_name}</p>
                  <p className="text-xs text-muted">
                    {lead.business_name || lead.project_type} · {new Date(lead.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <StatusBadge status={lead.status} />
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Payout summary */}
      {pendingPayouts > 0 && (
        <div className="mt-8 rounded-xl border border-gold/30 bg-gold/5 p-4">
          <p className="text-sm font-medium text-gold">
            💰 {pendingPayouts} commission{pendingPayouts > 1 ? "s" : ""} pending payout
          </p>
          <Link href="/portal/payouts" className="mt-1 block text-xs text-muted hover:text-gold">
            View payout details →
          </Link>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center">
      <p className="text-sm text-muted">No leads yet.</p>
      <Link href="/portal/submit" className="mt-2 inline-block text-sm text-gold hover:underline">
        Submit your first lead →
      </Link>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </main>
  );
}
