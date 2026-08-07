"use client";

import { useState } from "react";
import { useRequireRole } from "@/lib/use-require-auth";
import { useAsync } from "@/lib/use-async";
import { approvePartnerApplication, getPartnerApplications, updatePartnerApplicationStatus } from "@/lib/api";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PageHeader, EmptyState } from "@/components/ui";
import type { PartnerApplication, ReferrerStatus } from "@/lib/types";

const statusStyles: Record<ReferrerStatus, string> = {
  pending: "bg-warning/20 text-warning",
  approved: "bg-success/20 text-success",
  rejected: "bg-danger/20 text-danger",
  suspended: "bg-danger/20 text-danger",
};

export default function AdminReferrersPage() {
  const loading = useRequireRole("admin");
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: applications, loading: applicationsLoading, error } = useAsync(getPartnerApplications, [refreshKey]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading || applicationsLoading) return <LoadingSpinner />;

  const rows = applications || [];
  const pending = rows.filter((application) => application.review_status === "pending");
  const reviewed = rows.filter((application) => application.review_status !== "pending");

  async function updateStatus(id: string, status: ReferrerStatus) {
    setUpdatingId(id);
    setActionError(null);
    const result = status === "approved"
      ? await approvePartnerApplication(id, noteId === id ? note : undefined)
      : await updatePartnerApplicationStatus(id, status, noteId === id ? note : undefined);
    setUpdatingId(null);
    if (!result.error) {
      setNoteId(null);
      setNote("");
      setRefreshKey((current) => current + 1);
    } else {
      setActionError(result.error);
    }
  }

  return (
    <main className="mx-auto max-w-[var(--max)] px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader title="Partner Applications" subtitle="Review applicants before granting partner dashboard access." />

      {error && <p role="alert" className="mt-6 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">Unable to load applications. Check the Supabase migration and permissions.</p>}
      {actionError && <p role="alert" className="mt-6 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{actionError}</p>}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-warning">Awaiting Review ({pending.length})</h2>
            <p className="mt-1 text-xs text-muted">Applications are not partner accounts until approved.</p>
          </div>
        </div>
        <div className="mt-3 space-y-3">
          {pending.length === 0 ? <EmptyState message="No applications are currently awaiting review." /> : pending.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              updating={updatingId === application.id}
              noteOpen={noteId === application.id}
              note={note}
              onNoteChange={setNote}
              onToggleNote={() => setNoteId(noteId === application.id ? null : application.id)}
              onApprove={() => updateStatus(application.id, "approved")}
              onReject={() => updateStatus(application.id, "rejected")}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Reviewed Applications ({reviewed.length})</h2>
        <div className="mt-3 space-y-2">
          {reviewed.length === 0 ? <EmptyState message="Reviewed applications will appear here." /> : reviewed.map((application) => (
            <ApplicationCard key={application.id} application={application} updating={false} compact />
          ))}
        </div>
      </section>
    </main>
  );
}

function ApplicationCard({
  application,
  updating,
  compact = false,
  noteOpen = false,
  note = "",
  onNoteChange,
  onToggleNote,
  onApprove,
  onReject,
}: {
  application: PartnerApplication;
  updating: boolean;
  compact?: boolean;
  noteOpen?: boolean;
  note?: string;
  onNoteChange?: (value: string) => void;
  onToggleNote?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{application.full_name}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase ${statusStyles[application.review_status]}`}>
              {application.review_status}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{application.email} · {application.phone} · {application.location}</p>
          {!compact && <p className="mt-3 text-sm text-cream">{application.network_description}</p>}
        </div>
        {!compact && onApprove && onReject && (
          <div className="flex shrink-0 gap-2">
            <button disabled={updating} onClick={onApprove} className="rounded-lg bg-success px-3 py-2 text-xs font-semibold text-dark disabled:opacity-50">{updating ? "Saving..." : "Approve"}</button>
            <button disabled={updating} onClick={onReject} className="rounded-lg border border-danger/40 px-3 py-2 text-xs font-medium text-danger disabled:opacity-50">Reject</button>
          </div>
        )}
      </div>

      {!compact && (
        <>
          <dl className="mt-4 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Profession" value={application.profession || "Not provided"} />
            <Info label="Partner type" value={application.partner_type || "Not provided"} />
            <Info label="Sectors" value={application.sectors || "Not provided"} />
            <Info label="Expected referrals" value={application.estimated_monthly_referrals || "Not provided"} />
          </dl>
          <p className="mt-3 text-xs text-muted">Method: {application.referral_method || "Not provided"} · Applied {new Date(application.created_at).toLocaleDateString("en-GB")}</p>
          {onToggleNote && <button onClick={onToggleNote} className="mt-4 text-xs text-gold hover:underline">{noteOpen ? "Hide review note" : "Add review note"}</button>}
          {noteOpen && onNoteChange && <textarea value={note} onChange={(event) => onNoteChange(event.target.value)} placeholder="Optional internal review note" rows={2} className="input mt-2 w-full resize-none" />}
        </>
      )}

      {compact && application.review_note && <p className="mt-2 text-xs text-muted">Review note: {application.review_note}</p>}
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[0.65rem] uppercase tracking-wider text-muted">{label}</dt><dd className="mt-1 text-cream">{value}</dd></div>;
}
