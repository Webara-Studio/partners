"use client";

import { useState, use } from "react";
import { useRequireRole } from "@/lib/use-require-auth";
import { useAsync } from "@/lib/use-async";
import { getLead, getLeadEvents, updateLeadStatus } from "@/lib/api";
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
  const [transitioning, setTransitioning] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: lead } = useAsync(() => getLead(id), [id, refreshKey]);
  const { data: events } = useAsync(
    () => (lead ? getLeadEvents(lead.id) : Promise.resolve([])),
    [lead?.id, refreshKey]
  );

  if (loading) return <LoadingSpinner />;

  const resolvedLead = lead;
  const resolvedEvents = events || [];

  if (!resolvedLead) {
    return (
      <main className="mx-auto max-w-[var(--max)] px-6 py-16 text-center">
        <p className="text-muted">Lead not found.</p>
        <Link href="/admin/leads" className="mt-4 inline-block text-gold hover:underline">← Back to queue</Link>
      </main>
    );
  }

  const currentStatus = status || resolvedLead.status;
  const validNextStatuses = VALID_TRANSITIONS[currentStatus] || [];

  const handleStatusChange = async () => {
    if (!showTransitionModal) return;
    setTransitioning(true);
    setTransitionError(null);
    const result = await updateLeadStatus(
      resolvedLead.id,
      showTransitionModal,
      transitionNote || undefined
    );
    setTransitioning(false);
    if (result.error) {
      setTransitionError(result.error);
      return;
    }
    // Refresh data from DB
    setStatus(null);
    setTransitionNote("");
    setShowTransitionModal(null);
    setRefreshKey((k) => k + 1);
  };

  // Commission preview
  const commissionTier = PROGRAMME_RULES.commissionTiers[resolvedLead.project_type];
  const showCommissionSection = currentStatus === "won";

  return (
    <main className="mx-auto max-w-[var(--max)] px-4 py-6 sm:px-6 sm:py-8">
      <BackLink href="/admin/leads">← Back to queue</BackLink>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">{resolvedLead.prospect_name}</h1>
          <StatusBadge status={currentStatus} />
        </div>
        <p className="text-sm text-muted">
          {resolvedLead.business_name || resolvedLead.project_type.replace("_", " ")} · {resolvedLead.prospect_location} · Referrer: {resolvedLead.referrer_id}
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
              <DetailRow label="Phone" value={resolvedLead.prospect_phone} />
              {resolvedLead.prospect_email && <DetailRow label="Email" value={resolvedLead.prospect_email} />}
              {resolvedLead.business_name && <DetailRow label="Business" value={resolvedLead.business_name} />}
              <DetailRow label="Project Type" value={resolvedLead.project_type.replace("_", " ")} />
              <DetailRow label="Location" value={resolvedLead.prospect_location} />
              {resolvedLead.budget && <DetailRow label="Budget" value={resolvedLead.budget} />}
              <DetailRow label="Payment Status" value={PAYMENT_STATUS_CONFIG[resolvedLead.payment_status].label} />
            </dl>
          </DetailCard>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-gold">Project Brief</h3>
            <p className="text-sm text-cream">{resolvedLead.service_interest}</p>
            <p className="mt-2 text-sm text-muted">{resolvedLead.description}</p>
            {resolvedLead.note && (
              <p className="mt-3 border-t border-border pt-3 text-xs italic text-muted">
                Referrer note: {resolvedLead.note}
              </p>
            )}
          </div>

          {/* Commission section (won leads) */}
          {showCommissionSection && (
            <DetailCard title="Commission" variant="gold">
              <dl className="space-y-2 text-sm">
                <DetailRow label="Amount" value={`$${commissionTier.amount} ${commissionTier.currency}`} />
                <DetailRow label="Rule Version" value={PROGRAMME_RULES.currentRuleVersion} />
                <DetailRow label="Trigger" value="Client payment completed" />
                <DetailRow label="Payment Status" value={PAYMENT_STATUS_CONFIG[resolvedLead.payment_status].label} />
              </dl>
              {resolvedLead.payment_status === "completed" && (
                <p className="mt-3 text-xs text-success">
                  ✓ Payment complete — commission is eligible
                </p>
              )}
              {resolvedLead.payment_status === "pending" && (
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
              {resolvedEvents.length === 0 ? (
                <p className="text-xs text-muted">No events yet.</p>
              ) : (
                resolvedEvents
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
          onConfirm={handleStatusChange}
          onCancel={() => {
            setShowTransitionModal(null);
            setTransitionNote("");
            setTransitionError(null);
          }}
          transitioning={transitioning}
          error={transitionError}
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
  transitioning,
  error,
}: {
  targetStatus: LeadStatus;
  currentStatus: LeadStatus;
  note: string;
  onNoteChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  transitioning: boolean;
  error: string | null;
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
        {error && (
          <p className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}
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
            disabled={transitioning}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted hover:border-gold/50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={transitioning}
            className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-dark transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: targetConfig.color }}
          >
            {transitioning ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
