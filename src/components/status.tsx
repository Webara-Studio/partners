import type { LeadStatus } from "@/lib/types";
import { LEAD_STATUS_CONFIG } from "@/lib/constants";

/**
 * Coloured status badge for leads.
 */
export function StatusBadge({ status }: { status: LeadStatus }) {
  const config = LEAD_STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider"
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
 */
export function PipelineProgress({ status }: { status: LeadStatus }) {
  const phases = [
    { label: "Submitted", statuses: ["submitted"] },
    { label: "Review", statuses: ["under_review", "contacted"] },
    { label: "Qualified", statuses: ["qualified"] },
    { label: "Proposal", statuses: ["proposal_sent"] },
    { label: "Won", statuses: ["won"] },
  ];

  // Exception statuses don't show on the pipeline
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
    <div className="flex items-center gap-1">
      {phases.map((phase, i) => {
        const isComplete = i < currentPhaseIdx;
        const isCurrent = i === currentPhaseIdx;
        return (
          <div key={phase.label} className="flex flex-1 items-center gap-1">
            <div className="flex flex-col items-center">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isComplete ? "bg-gold" : isCurrent ? "bg-gold ring-2 ring-gold/30" : "bg-card"
                }`}
              />
              <span className={`mt-1 text-[0.55rem] ${isCurrent || isComplete ? "text-gold" : "text-muted"}`}>
                {phase.label}
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
      <div className="flex-1">
        <div className="flex items-center gap-2">
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
