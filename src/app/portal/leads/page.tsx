"use client";

import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/lib/use-require-auth";
import { getLeadsByReferrer } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status";
import Link from "next/link";
import type { LeadStatus } from "@/lib/types";

export default function LeadsListPage() {
  const { user } = useAuth();
  const loading = useRequireRole("referrer");

  if (loading || !user) return <LoadingSpinner />;

  const leads = getLeadsByReferrer(user.id).sort(
    (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );

  // Group by status category
  const active: LeadStatus[] = ["submitted", "under_review", "contacted", "qualified", "proposal_sent", "won"];
  const activeLeads = leads.filter((l) => active.includes(l.status));
  const closedLeads = leads.filter((l) => !active.includes(l.status));

  return (
    <main className="mx-auto max-w-[var(--max)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Your Leads</h1>
        <Link
          href="/portal/submit"
          className="rounded-lg bg-gold px-5 py-2.5 text-center text-sm font-semibold text-dark transition hover:opacity-90"
        >
          + Submit Lead
        </Link>
      </div>

      {/* Active leads */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Active ({activeLeads.length})
        </h2>
        <div className="mt-3 space-y-2">
          {activeLeads.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
              No active leads. Submit one to get started!
            </p>
          ) : (
            activeLeads.map((lead) => <LeadRow key={lead.id} lead={lead} />)
          )}
        </div>
      </div>

      {/* Closed leads */}
      {closedLeads.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Closed ({closedLeads.length})
          </h2>
          <div className="mt-3 space-y-2 opacity-60">
            {closedLeads.map((lead) => <LeadRow key={lead.id} lead={lead} />)}
          </div>
        </div>
      )}
    </main>
  );
}

function LeadRow({ lead }: { lead: ReturnType<typeof getLeadsByReferrer>[0] }) {
  return (
    <Link
      href={`/portal/leads/${lead.id}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-3 transition hover:border-gold/50 sm:px-4"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{lead.prospect_name}</p>
        <p className="truncate text-xs text-muted">
          {lead.business_name || lead.project_type.replace("_", " ")} ·{" "}
          {new Date(lead.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </p>
      </div>
      <StatusBadge status={lead.status} />
    </Link>
  );
}

function LoadingSpinner() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </main>
  );
}
