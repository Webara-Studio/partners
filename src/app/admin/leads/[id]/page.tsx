"use client";

import { useState, use } from "react";
import { useRequireRole } from "@/lib/use-require-auth";
import { getLead, getLeadEvents } from "@/lib/api";
import {
  LEAD_STATUS_CONFIG,
  VALID_TRANSITIONS,
  PAYMENT_STATUS_CONFIG,
  PROGRAMME_RULES,
} from "@/lib/constants";
import { StatusBadge, PipelineProgress, TimelineEvent } from "@/components/status";
import { LoadingSpinner } from "@/components/loading-spinner";
import { BackLink, DetailRow, DetailCard } from "@/components/ui";
import Link from "next/link";
import type { LeadStatus } from "@/lib/types";

export default function AdminLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const loading = useRequireRole("admin");
  const [status, setStatus] = useState<LeadStatus | null>(null);
  const [transitionNote, setTransitionNote] = useState("");
  const [showTransitionModal, setShowTransitionModal] = useState<LeadStatus | null>(null);

  if (loading) return <LoadingSpinner />;

  const lead = getLead(id);
  if (!lead) {
    return (
      <main className="mx-auto max-w-[var(--max)] px-6 py-16 text-center">
        <p className="text-muted">Lead not found.</p>
        <Link href="/admin/leads" className="mt-4 inline-block text-gold hover:underline">← Back to queue</Link>
      </main>
    );
  }

  const currentStatus = status || lead.status;
  const events = getLeadEvents(lead.id);
  const validNextStatuses = VALID_TRANSITIONS[currentStatus] || [];

  // Commission preview
  const commissionTier = PROGRAMME_RULES.commissionTiers[lead.project_type];
  const showCommissionSection = currentStatus === "won";

  return (
    <main className="mx-auto max-w-[var(--max)] px-4 py-6 sm:px-6 sm:py-8">
      <BackLink href="/admin/leads">← Back to queue</BackLink>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">{lead.prospect_name}</h1>
          <StatusBadge status={currentStatus} />
        </div>
        <p className="text-sm text-muted">
          {lead.business_name || lead.project_type.replace("_", " ")} · {lead.prospect_location} · Referrer: {lead.referrer_id}
        </p>
      </div>

      {/* Pipeline */}
      <div className="mt-8 rounded-xl border border-border bg-card p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Pipeline</p>
        <PipelineProgress status={currentStatus} />
      </div>

      {/* Status Controls */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-gold">Status Controls</h3>
        {validNextStatuses.length === 0 ? (
          <p className="text-sm text-muted">
            This lead is in a terminal state. No further transitions available.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {validNextStatuses.map((nextStatus) => {
              const config = LEAD_STATUS_CONFIG[nextStatus];
              return (
                <button
                  key={nextStatus}
                  onClick={() => setShowTransitionModal(nextStatus)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:opacity-80"
                  style={{
                    borderColor: `${config.color}40`,
                    color: config.color,
                    backgroundColor: `${config.color}0d`,
                  }}
                >
                  → {config.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Two columns */}
      <div className="mt-6 grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Left: Details */}
        <div className="space-y-6">
          <DetailCard title="Prospect Details">
            <dl className="space-y-2 text-sm">
              <DetailRow label="Phone" value={lead.prospect_phone} />
              {lead.prospect_email && <DetailRow label="Email" value={lead.prospect_email} />}
              {lead.business_name && <DetailRow label="Business" value={lead.business_name} />}
              <DetailRow label="Project Type" value={lead.project_type.replace("_", " ")} />
              <DetailRow label="Location" value={lead.prospect_location} />
              {lead.budget && <DetailRow label="Budget" value={lead.budget} />}
              <DetailRow label="Payment Status" value={PAYMENT_STATUS_CONFIG[lead.payment_status].label} />
            </dl>
          </DetailCard>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-gold">Project Brief</h3>
            <p className="text-sm text-cream">{lead.service_interest}</p>
            <p className="mt-2 text-sm text-muted">{lead.description}</p>
            {lead.note && (
              <p className="mt-3 border-t border-border pt-3 text-xs italic text-muted">
                Referrer note: {lead.note}
              </p>
            )}
          </div>

          {/* Commission section (won leads) */}
          {showCommissionSection && (
            <DetailCard title="Commission" variant="gold">
              <dl className="space-y-2 text-sm">
                <DetailRow label="Amount" value={`£${commissionTier.amount} ${commissionTier.currency}`} />
                <DetailRow label="Rule Version" value={PROGRAMME_RULES.currentRuleVersion} />
                <DetailRow label="Trigger" value="Client payment completed" />
                <DetailRow label="Payment Status" value={PAYMENT_STATUS_CONFIG[lead.payment_status].label} />
              </dl>
              {lead.payment_status === "completed" && (
                <p className="mt-3 text-xs text-success">
                  ✓ Payment complete — commission is eligible
                </p>
              )}
              {lead.payment_status === "pending" && (
                <p className="mt-3 text-xs text-warning">
                  ⏳ Awaiting client payment before commission can be released
                </p>
              )}
            </DetailCard>
          )}
        </div>

        {/* Right: Timeline */}
        <div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-gold">Audit Trail</h3>
            <div className="space-y-0">
              {events.length === 0 ? (
                <p className="text-xs text-muted">No events yet.</p>
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

      {/* Transition Modal */}
      {showTransitionModal && (
        <TransitionModal
          targetStatus={showTransitionModal}
          currentStatus={currentStatus}
          note={transitionNote}
          onNoteChange={setTransitionNote}
          onConfirm={() => {
            setStatus(showTransitionModal);
            setShowTransitionModal(null);
            setTransitionNote("");
          }}
          onCancel={() => {
            setShowTransitionModal(null);
            setTransitionNote("");
          }}
        />
      )}
    </main>
  );
}

function TransitionModal({
  targetStatus,
  currentStatus,
  note,
  onNoteChange,
  onConfirm,
  onCancel,
}: {
  targetStatus: LeadStatus;
  currentStatus: LeadStatus;
  note: string;
  onNoteChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const targetConfig = LEAD_STATUS_CONFIG[targetStatus];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl border border-border bg-card p-5 sm:rounded-2xl sm:p-6">
        <h3 className="text-lg font-bold">Confirm Status Change</h3>
        <div className="mt-4 flex items-center gap-3">
          <StatusBadge status={currentStatus} />
          <span className="text-muted">→</span>
          <StatusBadge status={targetStatus} />
        </div>
        <p className="mt-4 text-sm text-muted">{targetConfig.description}</p>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={3}
          placeholder="Add a note (optional)..."
          className="mt-4 w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-cream outline-none focus:border-gold"
        />
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted hover:border-gold/50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-dark"
            style={{ backgroundColor: targetConfig.color }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
