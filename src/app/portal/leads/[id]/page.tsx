"use client";

import { use } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/lib/use-require-auth";
import { useAsync } from "@/lib/use-async";
import { getLead, getLeadEvents, getCommissionForLead } from "@/lib/api";
import { PAYMENT_STATUS_CONFIG, COMMISSION_STATUS_CONFIG } from "@/lib/constants";
import { StatusBadge, PipelineProgress, TimelineEvent } from "@/components/status";
import { LoadingSpinner } from "@/components/loading-spinner";
import { BackLink, DetailRow, DetailCard } from "@/components/ui";
import Link from "next/link";

export default function PortalLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const loading = useRequireRole("referrer");

  const { data: lead } = useAsync(() => getLead(id), [id]);
  const { data: eventsData } = useAsync(() => (lead ? getLeadEvents(lead.id) : Promise.resolve([])), [lead?.id]);
  const { data: commission } = useAsync(
    () => (lead && user ? getCommissionForLead(lead.id, user.id) : Promise.resolve(null)),
    [lead?.id, user?.id]
  );

  if (loading || !user) return <LoadingSpinner />;

  if (!lead) {
    return (
      <main className="mx-auto max-w-[var(--max)] px-4 py-16 text-center">
        <p className="text-muted">Lead not found.</p>
        <BackLink href="/portal/leads" className="mt-4 inline-block">← Back to leads</BackLink>
      </main>
    );
  }

  if (lead.referrer_id !== user.id) {
    return (
      <main className="mx-auto max-w-[var(--max)] px-4 py-16 text-center">
        <p className="text-danger">You don&apos;t have access to this lead.</p>
        <BackLink href="/portal/leads" className="mt-4 inline-block">← Back to leads</BackLink>
      </main>
    );
  }

  const events = eventsData || [];

  return (
    <main className="mx-auto max-w-[var(--max)] px-4 py-6 sm:px-6 sm:py-8">
      <BackLink href="/portal/leads">← Back to leads</BackLink>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">{lead.prospect_name}</h1>
          <StatusBadge status={lead.status} />
        </div>
        <p className="text-sm text-muted">
          {lead.business_name || lead.project_type.replace("_", " ")} · {lead.prospect_location}
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-4 sm:mt-8 sm:p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Pipeline</p>
        <PipelineProgress status={lead.status} />
      </div>

      <div className="mt-6 grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <DetailCard title="Prospect Details">
            <dl className="space-y-2 text-sm">
              <DetailRow label="Phone" value={lead.prospect_phone} />
              {lead.prospect_email && <DetailRow label="Email" value={lead.prospect_email} />}
              {lead.business_name && <DetailRow label="Business" value={lead.business_name} />}
              <DetailRow label="Project Type" value={lead.project_type.replace("_", " ")} />
              <DetailRow label="Location" value={lead.prospect_location} />
              {lead.budget && <DetailRow label="Budget" value={lead.budget} />}
            </dl>
          </DetailCard>

          <DetailCard title="Project Brief">
            <p className="text-sm text-cream">{lead.service_interest}</p>
            <p className="mt-2 text-sm text-muted">{lead.description}</p>
            {lead.note && (
              <p className="mt-3 border-t border-border pt-3 text-xs italic text-muted">
                Note: {lead.note}
              </p>
            )}
          </DetailCard>

          {lead.status === "won" && commission && (
            <DetailCard title="Commission" variant="gold">
              <dl className="space-y-2 text-sm">
                <DetailRow label="Amount" value={`$${commission.fixed_amount} ${commission.currency}`} />
                <DetailRow label="Rule Version" value={commission.rule_version} />
                <DetailRow label="Status" value={COMMISSION_STATUS_CONFIG[commission.status].label} />
              </dl>
            </DetailCard>
          )}
        </div>

        <DetailCard title="Status Timeline">
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
        </DetailCard>
      </div>
    </main>
  );
}
