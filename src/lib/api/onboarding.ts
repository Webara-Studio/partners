/** Data access layer for approved-partner onboarding. */

import type { PayoutMethod, ReferrerProfile } from "../types";
import { createClient } from "../supabase/client";

const supabase = createClient();
export const PARTNER_TERMS_VERSION = "2026-08-gh-v2";

export type PartnerOnboardingData = {
  payout_method: PayoutMethod;
  payout_account_name: string;
  payout_account_reference: string;
  payout_country: string;
};

export async function savePartnerOnboarding(
  userId: string,
  data: PartnerOnboardingData
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("webara_referrer_profiles")
    .update({
      payout_method: data.payout_method,
      payout_account_name: data.payout_account_name,
      payout_account_reference: data.payout_account_reference,
      payout_country: data.payout_country,
      payout_method_status: "pending",
      payout_updated_at: new Date().toISOString(),
      terms_version: PARTNER_TERMS_VERSION,
      terms_accepted_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return { error: error?.message || null };
}

export async function getMyReferrerProfile(userId: string): Promise<ReferrerProfile | null> {
  const { data, error } = await supabase
    .from("webara_referrer_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return null;
  return data as ReferrerProfile | null;
}
