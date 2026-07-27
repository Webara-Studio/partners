"use client";

import { useRequireRole } from "@/lib/use-require-auth";
import { getAllLeadsAdmin } from "@/lib/api";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PageHeader, StatCard, EmptyState } from "@/components/ui";
import { LeadRow } from "@/components/status";

export default function AdminOverviewPage() {
  const loading = useRequireRole("admin");

  if (loading) return <LoadingSpinner />;

  const allLeads = getAllLeadsAdmin();
  const actionRequired = allLeads.filter(
    (l) => l.status === "submitted" || (l.status === "won" && l.payment_status !== "completed")
  );

  return (
    <main className="mx-auto max-w-[var(--max)] px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader title="Admin Overview" subtitle="Programme dashboard and lead queue." />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 sm:mt-8 lg:grid-cols-5">
        <StatCard label="Total" value={allLeads.length} color="text-info" />
        <StatCard label="New" value={allLeads.filter((l) => l.status === "submitted").length} color="text-warning" />
        <StatCard label="In Pipeline" value={allLeads.filter((l) => ["under_review", "contacted", "qualified", "proposal_sent"].includes(l.status)).length} color="text-gold" />
        <StatCard label="Won" value={allLeads.filter((l) => l.status === "won").length} color="text-success" />
        <StatCard label="Payment Due" value={allLeads.filter((l) => l.status === "won" && l.payment_status === "pending").length} color="text-danger" />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Action Required</h2>
        <p className="mt-1 text-xs text-muted">New submissions and won projects awaiting payment confirmation.</p>
        <div className="mt-4 space-y-2">
          {actionRequired.length === 0 ? (
            <EmptyState message="All caught up! No items need attention." />
          ) : (
            actionRequired.map((lead) => <LeadRow key={lead.id} lead={lead} basePath="/admin" />)
          )}
        </div>
      </section>
    </main>
  );
}
