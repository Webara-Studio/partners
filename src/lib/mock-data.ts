/**
 * @fileoverview Mock data for development.
 *
 * This provides realistic mock data for the referral portal.
 * All data is labelled "PROTOTYPE" in the UI when mock mode is active.
 *
 * When Supabase lands, these will be replaced with real queries.
 * The function signatures stay the same so components don't change.
 */

import type {
  Profile,
  ReferrerProfile,
  ReferralLead,
  LeadEvent,
  Commission,
  Payout,
  LeaderboardEntry,
  Session,
  LeadStatus,
} from "./types";

// ─── Flag ────────────────────────────────────────────────

export const IS_MOCK = true;

// ─── Mock Session ────────────────────────────────────────

const mockReferrerProfile: ReferrerProfile = {
  user_id: "u-ref-001",
  referral_code: "OZY100",
  programme_status: "approved",
  approved_at: "2026-06-15T10:00:00Z",
  approved_by_admin_id: "u-admin-001",
  terms_version: "2026-01-v1",
  terms_accepted_at: "2026-06-15T09:55:00Z",
  payout_method_status: "verified",
};

export const mockReferrerUser: Profile = {
  id: "u-ref-001",
  display_name: "Ozzy Referrer",
  email: "ozzy@example.com",
  role: "referrer",
  status: "approved",
  created_at: "2026-06-01T12:00:00Z",
  updated_at: "2026-06-15T10:00:00Z",
};

export const mockAdminUser: Profile = {
  id: "u-admin-001",
  display_name: "Admin User",
  email: "admin@webarastudio.com",
  role: "admin",
  status: "approved",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

export function getMockSession(role: "referrer" | "admin" = "referrer"): Session {
  if (role === "admin") {
    return { user: mockAdminUser, referrerProfile: null };
  }
  return { user: mockReferrerUser, referrerProfile: mockReferrerProfile };
}

// ─── Mock Leads ─────────────────────────────────────────

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString();

export const mockLeads: ReferralLead[] = [
  {
    id: "lead-001",
    referrer_id: "u-ref-001",
    prospect_name: "James Carter",
    prospect_phone: "+447700900123",
    prospect_email: "james@carterplumbing.co.uk",
    business_name: "Carter Plumbing",
    project_type: "website",
    service_interest: "Business website with booking system",
    prospect_location: "Manchester, UK",
    budget: "£2,000-5,000",
    description: "Plumber needing a professional website with online booking and payment integration.",
    consent: true,
    note: "Met at a networking event, very interested.",
    status: "won",
    payment_status: "completed",
    duplicate_of: null,
    won_at: daysAgo(5),
    payment_completed_at: daysAgo(2),
    submitted_at: daysAgo(30),
    updated_at: daysAgo(2),
  },
  {
    id: "lead-002",
    referrer_id: "u-ref-001",
    prospect_name: "Sarah Chen",
    prospect_phone: "+447700900456",
    prospect_email: "sarah@brightfitness.com",
    business_name: "Bright Fitness",
    project_type: "web_app",
    service_interest: "Fitness booking platform",
    prospect_location: "London, UK",
    budget: "£10,000-20,000",
    description: "Gym chain wanting a custom booking platform with class scheduling and member management.",
    consent: true,
    note: "Referred by a mutual contact, budget is confirmed.",
    status: "proposal_sent",
    payment_status: "not_due",
    duplicate_of: null,
    won_at: null,
    payment_completed_at: null,
    submitted_at: daysAgo(15),
    updated_at: daysAgo(3),
  },
  {
    id: "lead-003",
    referrer_id: "u-dev-002",
    prospect_name: "Mike Davies",
    prospect_phone: "+447700900789",
    prospect_email: null,
    business_name: null,
    project_type: "website",
    service_interest: "Restaurant website",
    prospect_location: "Birmingham, UK",
    budget: null,
    description: "Restaurant owner wanting a website with online menu and reservation system.",
    consent: true,
    note: null,
    status: "qualified",
    payment_status: "not_due",
    duplicate_of: null,
    won_at: null,
    payment_completed_at: null,
    submitted_at: daysAgo(8),
    updated_at: daysAgo(4),
  },
  {
    id: "lead-004",
    referrer_id: "u-ref-001",
    prospect_name: "Priya Sharma",
    prospect_phone: "+447700900222",
    prospect_email: "priya@spicegarden.com",
    business_name: "Spice Garden",
    project_type: "website",
    service_interest: "Restaurant website + ordering",
    prospect_location: "Leeds, UK",
    budget: "£1,500-3,000",
    description: "Indian restaurant needing website with online ordering and delivery tracking.",
    consent: true,
    note: null,
    status: "contacted",
    payment_status: "not_due",
    duplicate_of: null,
    won_at: null,
    payment_completed_at: null,
    submitted_at: daysAgo(5),
    updated_at: daysAgo(2),
  },
  {
    id: "lead-005",
    referrer_id: "u-ref-001",
    prospect_name: "Tom Wilson",
    prospect_phone: "+447700900333",
    prospect_email: "tom@wilsondesign.co.uk",
    business_name: "Wilson Design Studio",
    project_type: "web_app",
    service_interest: "Portfolio + client portal",
    prospect_location: "Bristol, UK",
    budget: "£5,000-10,000",
    description: "Design studio wanting a portfolio site with a private client portal for project management.",
    consent: true,
    note: "High-value lead, very motivated.",
    status: "submitted",
    payment_status: "not_due",
    duplicate_of: null,
    won_at: null,
    payment_completed_at: null,
    submitted_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
];

// ─── Mock Events ─────────────────────────────────────────

export const mockEvents: LeadEvent[] = [
  {
    id: "evt-001",
    lead_id: "lead-001",
    actor_id: "u-admin-001",
    actor_name: "Admin",
    from_status: null,
    to_status: "submitted",
    note: "Lead submitted",
    created_at: daysAgo(30),
  },
  {
    id: "evt-002",
    lead_id: "lead-001",
    actor_id: "u-admin-001",
    actor_name: "Admin",
    from_status: "submitted",
    to_status: "under_review",
    note: "Reviewing lead",
    created_at: daysAgo(28),
  },
  {
    id: "evt-003",
    lead_id: "lead-001",
    actor_id: "u-admin-001",
    actor_name: "Admin",
    from_status: "under_review",
    to_status: "contacted",
    note: "Called prospect, good fit",
    created_at: daysAgo(25),
  },
  {
    id: "evt-004",
    lead_id: "lead-001",
    actor_id: "u-admin-001",
    actor_name: "Admin",
    from_status: "contacted",
    to_status: "qualified",
    note: "Confirmed requirements and budget",
    created_at: daysAgo(20),
  },
  {
    id: "evt-005",
    lead_id: "lead-001",
    actor_id: "u-admin-001",
    actor_name: "Admin",
    from_status: "qualified",
    to_status: "proposal_sent",
    note: "Sent proposal for £4,500 website + booking system",
    created_at: daysAgo(15),
  },
  {
    id: "evt-006",
    lead_id: "lead-001",
    actor_id: "u-admin-001",
    actor_name: "Admin",
    from_status: "proposal_sent",
    to_status: "won",
    note: "Client accepted! Project starting next week",
    created_at: daysAgo(5),
  },
];

// ─── Mock Commissions ────────────────────────────────────

export const mockCommissions: Commission[] = [
  {
    id: "comm-001",
    lead_id: "lead-001",
    referrer_id: "u-ref-001",
    fixed_amount: 150,
    currency: "GBP",
    rule_version: "2026-01-v1",
    status: "paid",
    eligible_at: daysAgo(2),
    created_at: daysAgo(2),
  },
];

// ─── Mock Payouts ────────────────────────────────────────

export const mockPayouts: Payout[] = [
  {
    id: "pay-001",
    commission_id: "comm-001",
    referrer_id: "u-ref-001",
    amount: 150,
    currency: "GBP",
    method: "bank_transfer",
    status: "paid",
    paid_at: daysAgo(1),
    recorded_by_admin_id: "u-admin-001",
    receipt_url: null,
    receipt_label: "Bank transfer ref: WEBA-001",
    admin_note: "Paid via bank transfer",
    created_at: daysAgo(1),
  },
];

// ─── Mock Leaderboard ────────────────────────────────────

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, display_name: "Ozzy Referrer", qualified_leads: 8, won_referrals: 3, total_payout: 450, currency: "GBP" },
  { rank: 2, display_name: "Sarah K.", qualified_leads: 5, won_referrals: 2, total_payout: 300, currency: "GBP" },
  { rank: 3, display_name: "Marcus T.", qualified_leads: 4, won_referrals: 1, total_payout: 150, currency: "GBP" },
  { rank: 4, display_name: "Linda M.", qualified_leads: 3, won_referrals: 1, total_payout: 300, currency: "GBP" },
  { rank: 5, display_name: "David R.", qualified_leads: 2, won_referrals: 0, total_payout: 0, currency: "GBP" },
];

// ─── Data Accessors (mock) ───────────────────────────────

export function getLeadsByReferrer(referrerId: string): ReferralLead[] {
  return mockLeads.filter((l) => l.referrer_id === referrerId);
}

export function getLeadById(leadId: string): ReferralLead | null {
  return mockLeads.find((l) => l.id === leadId) || null;
}

export function getEventsByLead(leadId: string): LeadEvent[] {
  return mockEvents.filter((e) => e.lead_id === leadId);
}

export function getCommissionsByReferrer(referrerId: string): Commission[] {
  return mockCommissions.filter((c) => c.referrer_id === referrerId);
}

export function getPayoutsByReferrer(referrerId: string): Payout[] {
  return mockPayouts.filter((p) => p.referrer_id === referrerId);
}

export function getAllLeads(): ReferralLead[] {
  return mockLeads;
}

export function getLeaderboard(): LeaderboardEntry[] {
  return mockLeaderboard;
}
