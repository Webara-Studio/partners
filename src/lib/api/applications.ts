/** Data access layer for public partner applications and admin review. */

import type { PartnerApplication, PartnerApplicationFormData, ReferrerStatus } from "../types";
import { createClient } from "../supabase/client";

const supabase = createClient();

export async function submitPartnerApplication(
  formData: PartnerApplicationFormData
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from("webara_referral_applications")
    .insert({
      ...formData,
      terms_version: "2026-08-gh-v2",
      terms_accepted_at: new Date().toISOString(),
      review_status: "pending",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function getPartnerApplications(): Promise<PartnerApplication[]> {
  const { data, error } = await supabase
    .from("webara_referral_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as PartnerApplication[];
}

export async function updatePartnerApplicationStatus(
  id: string,
  reviewStatus: ReferrerStatus,
  reviewNote?: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("webara_referral_applications")
    .update({
      review_status: reviewStatus,
      review_note: reviewNote || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  return { error: error?.message || null };
}

export async function approvePartnerApplication(
  id: string,
  reviewNote?: string
): Promise<{ error: string | null }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: "Your admin session has expired. Please sign in again." };

  const response = await fetch(`/api/admin/partner-applications/${id}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ review_note: reviewNote || null }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { error: body?.error || "Unable to approve this application." };
  }
  return { error: null };
}