"use client";

import { use } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/lib/use-require-auth";
import { getLeadById, getEventsByLead, getCommissionsByReferrer } from "@/lib/mock-data";
import { LEAD_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, COMMISSION_STATUS_CONFIG } from "@/lib/constants";
import { StatusBadge, PipelineProgress, TimelineEvent } from "@/components/status";
import Link from "next/link";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const loading = useRequireRole("referrer");

  if (loading || !user) return <LoadingSpinner />;

  const lead = getLeadById(id);
  if (!lead) {
    return (
      <main className="mx-auto max-w-[var(--max)] px-6 py-16 text-center">
        <p className="text-muted">Lead not found.</p>
        <Link href="/portal/leads" className="mt-4 inline-block text-gold hover:underline">
          ← Back to leads
        </Link>
      </main>
    );
  }

  // Security: referrer can only see their own leads
  if (lead.referrer_id !== user.id) {
    return (
      <main className="mx-auto max-w-[var(--max)] px-6 py-16 text-center">
        <p className="text-danger">You don&apos;t have access to this lead.</p>
        <Link href="/portal/leads" className="mt-4 inline-block text-gold hover:underline">
          ← Back to leads
        </Link>
      </main>
    );
  }

  const events = getEventsByLead(lead.id);
  const commission = getCommissionsByReferrer(user.id).find((c) => c.lead_id === lead.id);

  return (
    <main className="mx-auto max-w-[var(--max)] px-6 py-8">
      <Link href="/portal/leads" className="text-sm text-muted transition hover:text-gold">
        ← Back to leads
      </Link>

      {/* Header */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{lead.prospect_name}</h1>
            <StatusBadge status={lead.status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {lead.business_name || lead.project_type.replace("_", " ")} · {lead.prospect_location}
          </p>
        </div>
      </div>

      {/* Pipeline */}
      <div className="mt-8 rounded-xl border border-border bg-card p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Pipeline</p>
        <PipelineProgress status={lead.status} />
      </div>

      {/* Two-column layout */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Left: Details */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-gold">Prospect Details</h3>
            <dl className="space-y-2 text-sm">
              <Detail label="Phone" value={lead.prospect_phone} />
              {lead.prospect_email && <Detail label="Email" value={lead.prospect_email} />}
              {lead.business_name && <Detail label="Business" value={lead.business_name} />}
              <Detail label="Project Type" value={lead.project_type.replace("_", " ")} />
              <Detail label="Location" value={lead.prospect_location} />
              {lead.budget && <Detail label="Budget" value={lead.budget} />}
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-gold">Project Brief</h3>
            <p className="text-sm text-cream">{lead.service_interest}</p>
            <p className="mt-2 text-sm text-muted">{lead.description}</p>
            {lead.note && (
              <p className="mt-3 border-t border-border pt-3 text-xs italic text-muted">
                Note: {lead.note}
              </p>
            )}
          </div>

          {/* Commission (if won) */}
          {lead.status === "won" && commission && (
            <div className="rounded-xl border border-gold/30 bg-gold/5 p-5">
              <h3 className="mb-3 text-sm font-semibold text-gold">Commission</h3>
              <dl className="space-y-2 text-sm">
                <Detail label="Amount" value={`£${commission.fixed_amount} ${commission.currency}`} />
                <Detail label="Rule Version" value={commission.rule_version} />
                <Detail label="Status" value={COMMISSION_STATUS_CONFIG[commission.status].label} />
              </dl>
            </div>
          )}
        </div>

        {/* Right: Timeline */}
        <div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-gold">Status Timeline</h3>
            <div className="space-y-0">
              {events.length === 0 ? (
                <p className="text-xs text-muted">No events yet. Check back soon.</p>
              ) : (
                events
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((event) => (
                    <TimelineEvent
                      key={event.id}
                      fromStatus={event.from_status}
                      toStatus={event.to_status}
                      note={event.note}
                      actorName={event.actor_name}
                      createdAt={event.created_at}
                    />
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
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
