"use client";

import { useRequireRole } from "@/lib/use-require-auth";
import { getAllLeads } from "@/lib/mock-data";
import { LEAD_STATUS_CONFIG } from "@/lib/constants";
import Link from "next/link";

export default function AdminOverviewPage() {
  const loading = useRequireRole("admin");

  if (loading) return <LoadingSpinner />;

  const allLeads = getAllLeads();

  const stats = {
    total: allLeads.length,
    submitted: allLeads.filter((l) => l.status === "submitted").length,
    inPipeline: allLeads.filter((l) =>
      ["under_review", "contacted", "qualified", "proposal_sent"].includes(l.status)
    ).length,
    won: allLeads.filter((l) => l.status === "won").length,
    pendingPayment: allLeads.filter((l) => l.status === "won" && l.payment_status === "pending").length,
  };

  // Action required: new leads or won leads needing payment status
  const actionRequired = allLeads.filter(
    (l) => l.status === "submitted" || (l.status === "won" && l.payment_status !== "completed")
  );

  return (
    <main className="mx-auto max-w-[var(--max)] px-6 py-8">
      <h1 className="text-2xl font-bold">Admin Overview</h1>
      <p className="mt-1 text-sm text-muted">Programme dashboard and lead queue.</p>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Total Leads" value={stats.total} color="text-info" />
        <StatCard label="New" value={stats.submitted} color="text-warning" />
        <StatCard label="In Pipeline" value={stats.inPipeline} color="text-gold" />
        <StatCard label="Won" value={stats.won} color="text-success" />
        <StatCard label="Payment Due" value={stats.pendingPayment} color="text-danger" />
      </div>

      {/* Action Required */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold">Action Required</h2>
        <p className="mt-1 text-xs text-muted">New submissions and won projects awaiting payment confirmation.</p>
        <div className="mt-4 space-y-2">
          {actionRequired.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
              All caught up! No items need attention.
            </p>
          ) : (
            actionRequired.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition hover:border-gold/50"
              >
                <div>
                  <p className="font-medium">{lead.prospect_name}</p>
                  <p className="text-xs text-muted">
                    {lead.business_name || lead.project_type} · Referrer: {lead.referrer_id}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {lead.status === "won" && lead.payment_status !== "completed" && (
                    <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-warning">
                      Payment Due
                    </span>
                  )}
                  {lead.status === "submitted" && (
                    <span className="rounded-full bg-info/20 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-info">
                      New
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
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
