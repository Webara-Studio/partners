import type { LeadStatus } from "@/lib/types";
import { LEAD_STATUS_CONFIG } from "@/lib/constants";

/**
 * Coloured status badge for leads.
 */
export function StatusBadge({ status }: { status: LeadStatus }) {
  const config = LEAD_STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider"
      style={{
        color: config.color,
        backgroundColor: `${config.color}1a`,
        border: `1px solid ${config.color}33`,
      }}
    >
      {config.label}
    </span>
  );
}

/**
 * Pipeline progress bar showing where a lead sits in the funnel.
 * Responsive: shows abbreviated labels on mobile.
 */
export function PipelineProgress({ status }: { status: LeadStatus }) {
  const phases = [
    { label: "Submitted", short: "S1", statuses: ["submitted"] },
    { label: "Review", short: "S2", statuses: ["under_review", "contacted"] },
    { label: "Qualified", short: "S3", statuses: ["qualified"] },
    { label: "Proposal", short: "S4", statuses: ["proposal_sent"] },
    { label: "Won", short: "S5", statuses: ["won"] },
  ];

  const exceptionStatuses: LeadStatus[] = [
    "rejected", "duplicate", "unqualified", "lost", "cancelled"
  ];
  if (exceptionStatuses.includes(status)) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-center text-xs text-danger">
        {LEAD_STATUS_CONFIG[status].label}: {LEAD_STATUS_CONFIG[status].description}
      </div>
    );
  }

  const currentPhaseIdx = phases.findIndex((p) => p.statuses.includes(status));

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {phases.map((phase, i) => {
        const isComplete = i < currentPhaseIdx;
        const isCurrent = i === currentPhaseIdx;
        return (
          <div key={phase.label} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
            <div className="flex flex-col items-center">
              <div
                className={`h-2.5 w-2.5 rounded-full transition sm:h-3 sm:w-3 ${
                  isComplete ? "bg-gold" : isCurrent ? "bg-gold ring-2 ring-gold/30" : "bg-card"
                }`}
              />
              <span className={`mt-1 hidden text-[0.6rem] sm:inline ${isCurrent || isComplete ? "text-gold" : "text-muted"}`}>
                {phase.label}
              </span>
              <span className={`mt-1 text-[0.55rem] font-bold sm:hidden ${isCurrent || isComplete ? "text-gold" : "text-muted"}`}>
                {phase.short}
              </span>
            </div>
            {i < phases.length - 1 && (
              <div className={`h-0.5 flex-1 ${isComplete ? "bg-gold" : "bg-card"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Timeline event row.
 */
export function TimelineEvent({
  fromStatus,
  toStatus,
  note,
  actorName,
  createdAt,
}: {
  fromStatus: LeadStatus | null;
  toStatus: LeadStatus;
  note: string | null;
  actorName: string;
  createdAt: string;
}) {
  const config = LEAD_STATUS_CONFIG[toStatus];
  const date = new Date(createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex gap-3 border-l border-border pl-4 pb-4 last:border-l-transparent last:pb-0">
      <div
        className="-ml-[21px] mt-1 h-3 w-3 flex-shrink-0 rounded-full border-2"
        style={{ borderColor: config.color, backgroundColor: `${config.color}33` }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium" style={{ color: config.color }}>
            {config.label}
          </span>
          {fromStatus && (
            <span className="text-xs text-muted">
              from {LEAD_STATUS_CONFIG[fromStatus].label}
            </span>
          )}
        </div>
        {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
        <p className="mt-0.5 text-[0.65rem] text-muted">
          {actorName} · {date}
        </p>
      </div>
    </div>
  );
}
