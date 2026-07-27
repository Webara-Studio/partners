"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/lib/use-require-auth";
import { getLeadsForReferrer } from "@/lib/api";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PageHeader, EmptyState } from "@/components/ui";
import { LeadRow } from "@/components/status";
import Link from "next/link";
import type { LeadStatus } from "@/lib/types";

const ACTIVE_STATUSES: LeadStatus[] = ["submitted", "under_review", "contacted", "qualified", "proposal_sent", "won"];

export default function PortalLeadsPage() {
  const { user } = useAuth();
  const loading = useRequireRole("referrer");

  if (loading || !user) return <LoadingSpinner />;

  const leads = getLeadsForReferrer(user.id).sort(
    (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );

  const activeLeads = leads.filter((l) => ACTIVE_STATUSES.includes(l.status));
  const closedLeads = leads.filter((l) => !ACTIVE_STATUSES.includes(l.status));

  return (
    <main className="mx-auto max-w-[var(--max)] px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Your Leads"
        action={
          <Link
            href="/portal/submit"
            className="rounded-lg bg-gold px-5 py-2.5 text-center text-sm font-semibold text-dark transition hover:opacity-90"
          >
            + Submit Lead
          </Link>
        }
      />

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Active ({activeLeads.length})
        </h2>
        <div className="mt-3 space-y-2">
          {activeLeads.length === 0 ? (
            <EmptyState
              message="No active leads. Submit one to get started!"
              action={
                <Link href="/portal/submit" className="mt-2 inline-block text-sm text-gold hover:underline">
                  Submit your first lead →
                </Link>
              }
            />
          ) : (
            activeLeads.map((lead) => <LeadRow key={lead.id} lead={lead} basePath="/portal" />)
          )}
        </div>
      </section>

      {closedLeads.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Closed ({closedLeads.length})
          </h2>
          <div className="mt-3 space-y-2 opacity-60">
            {closedLeads.map((lead) => <LeadRow key={lead.id} lead={lead} basePath="/portal" />)}
          </div>
        </section>
      )}
    </main>
  );
}
