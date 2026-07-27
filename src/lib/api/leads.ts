/**
 * @fileoverview Data access layer for leads.
 *
 * Currently backed by mock-data.ts (synchronous).
 * When Supabase is connected, replace with async queries.
 * Pages import from here — never from mock-data directly.
 */

import type { ReferralLead, LeadEvent } from "../types";
import {
  getLeadsByReferrer as mock_getLeadsByReferrer,
  getLeadById as mock_getLeadById,
  getEventsByLead as mock_getEventsByLead,
  getAllLeads as mock_getAllLeads,
} from "../mock-data";

export function getLeadsForReferrer(referrerId: string): ReferralLead[] {
  return mock_getLeadsByReferrer(referrerId);
}

export function getLead(leadId: string): ReferralLead | null {
  return mock_getLeadById(leadId);
}

export function getLeadEvents(leadId: string): LeadEvent[] {
  return mock_getEventsByLead(leadId);
}

export function getAllLeadsAdmin(): ReferralLead[] {
  return mock_getAllLeads();
}

export function checkDuplicate(phone: string): boolean {
  return phone.includes("999");
}
