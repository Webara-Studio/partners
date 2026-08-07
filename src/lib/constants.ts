/**
 * @fileoverview Central configuration for Webara Partners.
 * All status definitions, colours, transitions, and programme rules.
 */

import type {
  LeadStatus,
  PaymentStatus,
  CommissionStatus,
  PayoutStatus,
} from "./types";

// ─── Brand ───────────────────────────────────────────────

export const BRAND = {
  name: "Webara Studio",
  domain: "webarastudio.com",
  url: "https://www.webarastudio.com",
  partnerPortalUrl: "https://partners.webarastudio.com",
  email: "hello@webarastudio.com",
} as const;

// ─── Lead Status Configuration ───────────────────────────

type StatusMeta = {
  label: string;
  color: string;
  description: string;
  isTerminal: boolean;
  isCommercial: boolean;
};

export const LEAD_STATUS_CONFIG: Record<LeadStatus, StatusMeta> = {
  submitted: {
    label: "Submitted",
    color: "#60a5fa",
    description: "Lead received and awaiting review",
    isTerminal: false,
    isCommercial: false,
  },
  under_review: {
    label: "Under Review",
    color: "#c084fc",
    description: "Admin is reviewing the lead",
    isTerminal: false,
    isCommercial: false,
  },
  contacted: {
    label: "Contacted",
    color: "#c084fc",
    description: "We've reached out to the prospect",
    isTerminal: false,
    isCommercial: false,
  },
  qualified: {
    label: "Qualified",
    color: "#fbbf24",
    description: "Prospect meets our criteria",
    isTerminal: false,
    isCommercial: false,
  },
  proposal_sent: {
    label: "Proposal Sent",
    color: "#fb923c",
    description: "We've sent a proposal to the prospect",
    isTerminal: false,
    isCommercial: true,
  },
  won: {
    label: "Won",
    color: "#4ade80",
    description: "The prospect accepted the proposal",
    isTerminal: false,
    isCommercial: true,
  },
  rejected: {
    label: "Rejected",
    color: "#f87171",
    description: "Lead was rejected",
    isTerminal: true,
    isCommercial: false,
  },
  duplicate: {
    label: "Duplicate",
    color: "#f87171",
    description: "Lead already exists in the system",
    isTerminal: true,
    isCommercial: false,
  },
  unqualified: {
    label: "Unqualified",
    color: "#f87171",
    description: "Prospect does not meet our criteria",
    isTerminal: true,
    isCommercial: false,
  },
  lost: {
    label: "Lost",
    color: "#f87171",
    description: "The prospect declined",
    isTerminal: true,
    isCommercial: false,
  },
  cancelled: {
    label: "Cancelled",
    color: "#f87171",
    description: "Lead was cancelled",
    isTerminal: true,
    isCommercial: false,
  },
};

// ─── Status Transition Rules ─────────────────────────────

/**
 * Valid transitions from each status.
 * Any status not listed = no outgoing transitions (terminal).
 */
export const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  submitted: ["under_review", "contacted", "rejected", "duplicate"],
  under_review: ["contacted", "qualified", "unqualified", "rejected"],
  contacted: ["qualified", "unqualified", "lost"],
  qualified: ["proposal_sent", "lost"],
  proposal_sent: ["won", "lost"],
  won: [], // Terminal for lead status — payment tracked separately
  rejected: [],
  duplicate: [],
  unqualified: [],
  lost: [],
  cancelled: [],
};

// ─── Payment Status ──────────────────────────────────────

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  not_due: { label: "Not Due", color: "#64748b" },
  pending: { label: "Payment Pending", color: "#fbbf24" },
  completed: { label: "Payment Complete", color: "#4ade80" },
  refunded: { label: "Refunded", color: "#f87171" },
};

// ─── Commission ──────────────────────────────────────────

export const COMMISSION_STATUS_CONFIG: Record<CommissionStatus, { label: string; color: string }> = {
  not_eligible: { label: "Not Eligible", color: "#64748b" },
  pending_review: { label: "Pending Review", color: "#fbbf24" },
  approved: { label: "Approved", color: "#4ade80" },
  scheduled: { label: "Scheduled", color: "#60a5fa" },
  paid: { label: "Paid", color: "#22c55e" },
  on_hold: { label: "On Hold", color: "#f87171" },
  reversed: { label: "Reversed", color: "#f87171" },
};

// ─── Payout ──────────────────────────────────────────────

export const PAYOUT_STATUS_CONFIG: Record<PayoutStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#fbbf24" },
  paid: { label: "Paid", color: "#22c55e" },
  on_hold: { label: "On Hold", color: "#f87171" },
  reversed: { label: "Reversed", color: "#f87171" },
};

// ─── Programme Rules ─────────────────────────────────────

export const PROGRAMME_RULES = {
  /** Commission trigger: payment must be completed before commission eligibility */
  commissionTrigger: "client_payment_completed" as const,

  /** Add-on commission continues while the referred client relationship remains active. */
  recurringCommission: "lifetime_of_referred_client_relationship" as const,

  /** Leaderboard ranks by won projects */
  leaderboardMetric: "won_referrals" as const,

  /** Ghana partner commission structure */
  commissionTiers: {
    website: { amount: 2500, currency: "GHS" },
    web_app: { amount: null, currency: "GHS", label: "Agreed case-by-case" },
    other: { amount: null, currency: "GHS", label: "Agreed case-by-case" },
  },
  addOnCommission: { percentage: 20, currency: "GHS" },

  /** Current rule version — stored on each commission for historical integrity */
  currentRuleVersion: "2026-08-gh-v2",

  /** Referral cookie duration in days */
  cookieExpiryDays: 90,
} as const;

// ─── Lead Pipeline Phases ────────────────────────────────

/**
 * Groups statuses into visual pipeline phases.
 * Used for the pipeline progress bar.
 */
export const PIPELINE_PHASES = [
  { phase: "Submitted", statuses: ["submitted"] },
  { phase: "Review", statuses: ["under_review", "contacted"] },
  { phase: "Qualified", statuses: ["qualified"] },
  { phase: "Proposal", statuses: ["proposal_sent"] },
  { phase: "Won", statuses: ["won"] },
] as const;
