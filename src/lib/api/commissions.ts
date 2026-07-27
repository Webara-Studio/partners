/**
 * @fileoverview Data access layer for commissions and payouts.
 * Backed by Supabase. RLS enforces all access control.
 */

import type { Commission, Payout } from "../types";
import { createClient } from "../supabase/client";

const supabase = createClient();

export async function getCommissionsForReferrer(referrerId: string): Promise<Commission[]> {
  const { data, error } = await supabase
    .from("webara_referral_commissions")
    .select("*")
    .eq("referrer_id", referrerId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data as Commission[];
}

export async function getPayoutsForReferrer(referrerId: string): Promise<Payout[]> {
  const { data, error } = await supabase
    .from("webara_referral_payouts")
    .select("*")
    .eq("referrer_id", referrerId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data as Payout[];
}

export async function getCommissionForLead(leadId: string, referrerId: string): Promise<Commission | null> {
  const { data, error } = await supabase
    .from("webara_referral_commissions")
    .select("*")
    .eq("lead_id", leadId)
    .eq("referrer_id", referrerId)
    .single();

  if (error) return null;
  return data as Commission;
}
