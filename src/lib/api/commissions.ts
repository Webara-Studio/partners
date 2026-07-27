/**
 * @fileoverview Data access layer for commissions and payouts.
 * Swap mock implementations for Supabase when ready.
 */

import type { Commission, Payout } from "../types";
import {
  getCommissionsByReferrer as mock_getCommissionsByReferrer,
  getPayoutsByReferrer as mock_getPayoutsByReferrer,
} from "../mock-data";

export function getCommissionsForReferrer(referrerId: string): Commission[] {
  return mock_getCommissionsByReferrer(referrerId);
}

export function getPayoutsForReferrer(referrerId: string): Payout[] {
  return mock_getPayoutsByReferrer(referrerId);
}

export function getCommissionForLead(leadId: string, referrerId: string): Commission | null {
  return getCommissionsForReferrer(referrerId).find((c) => c.lead_id === leadId) || null;
}
