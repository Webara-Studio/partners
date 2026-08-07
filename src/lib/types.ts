/**
 * @fileoverview Shared type definitions for Webara Partners.
 * Mirrors the eventual Supabase schema from plan.md.
 */

// ─── User & Roles ────────────────────────────────────────

export type UserRole = "user" | "referrer" | "admin";

export type ReferrerStatus = "pending" | "approved" | "suspended" | "rejected";

export type PartnerApplication = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  profession: string | null;
  partner_type: string | null;
  sectors: string | null;
  network_description: string;
  estimated_monthly_referrals: string | null;
  referral_method: string | null;
  how_did_you_hear: string | null;
  consent: boolean;
  terms_version: string;
  terms_accepted_at: string;
  review_status: ReferrerStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
};

export type PartnerApplicationFormData = Omit<
  PartnerApplication,
  "id" | "terms_version" | "terms_accepted_at" | "review_status" | "reviewed_by" | "reviewed_at" | "review_note" | "created_at"
>;

// ─── Lead Lifecycle ──────────────────────────────────────

export type LeadStatus =
  | "submitted"
  | "under_review"
  | "contacted"
  | "qualified"
  | "proposal_sent"
  | "won"
  | "rejected"
  | "duplicate"
  | "unqualified"
  | "lost"
  | "cancelled";

export type PaymentStatus =
  | "not_due"
  | "pending"
  | "completed"
  | "refunded";

export type ProjectType = "website" | "web_app" | "other";

export type CommissionType = "basic_website" | "add_on";

// ─── Commission & Payout ─────────────────────────────────

export type CommissionStatus =
  | "not_eligible"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "paid"
  | "on_hold"
  | "reversed";

export type PayoutStatus =
  | "pending"
  | "paid"
  | "on_hold"
  | "reversed";

export type PayoutMethod = "bank_transfer" | "momo" | "other";

// ─── Database Row Types ──────────────────────────────────

export type Profile = {
  id: string;
  display_name: string;
  email: string;
  role: UserRole;
  status: ReferrerStatus;
  created_at: string;
  updated_at: string;
};

export type ReferrerProfile = {
  user_id: string;
  referral_code: string;
  programme_status: ReferrerStatus;
  approved_at: string | null;
  approved_by_admin_id: string | null;
  terms_version: string;
  terms_accepted_at: string;
  payout_method_status: "not_set" | "pending" | "verified";
};

export type ReferralLead = {
  id: string;
  referrer_id: string;
  prospect_name: string;
  prospect_phone: string;
  prospect_email: string | null;
  business_name: string | null;
  project_type: ProjectType;
  service_interest: string;
  prospect_location: string;
  budget: string | null;
  description: string;
  consent: boolean;
  note: string | null;
  status: LeadStatus;
  payment_status: PaymentStatus;
  duplicate_of: string | null;
  won_at: string | null;
  payment_completed_at: string | null;
  submitted_at: string;
  updated_at: string;
};

export type LeadEvent = {
  id: string;
  lead_id: string;
  actor_id: string;
  actor_name: string;
  from_status: LeadStatus | null;
  to_status: LeadStatus;
  note: string | null;
  created_at: string;
};

export type Commission = {
  id: string;
  lead_id: string;
  referrer_id: string;
  type: CommissionType;
  fixed_amount: number | null;
  percentage: number | null;
  basis_amount: number | null;
  currency: "GHS";
  service_name: string | null;
  recurring: boolean;
  rule_version: string;
  status: CommissionStatus;
  eligible_at: string | null;
  created_at: string;
};

export type Payout = {
  id: string;
  commission_id: string;
  referrer_id: string;
  amount: number;
  currency: string;
  method: PayoutMethod;
  status: PayoutStatus;
  paid_at: string | null;
  recorded_by_admin_id: string;
  receipt_url: string | null;
  receipt_label: string | null;
  admin_note: string | null;
  created_at: string;
};

export type LeaderboardEntry = {
  rank: number;
  display_name: string;
  qualified_leads: number;
  won_referrals: number;
  total_payout: number;
  currency: string;
};

// ─── Session ─────────────────────────────────────────────

export type Session = {
  user: Profile;
  referrerProfile: ReferrerProfile | null;
};

// ─── Lead Form Input ─────────────────────────────────────

export type LeadFormData = {
  prospect_name: string;
  prospect_phone: string;
  prospect_email: string;
  business_name: string;
  project_type: ProjectType;
  service_interest: string;
  prospect_location: string;
  budget: string;
  description: string;
  consent: boolean;
  note: string;
};
