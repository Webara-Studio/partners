/**
 * @fileoverview Data access layer for leads.
 * Backed by Supabase. RLS enforces all access control.
 */

import type { ReferralLead, LeadEvent, LeadFormData } from "../types";
import { createClient } from "../supabase/client";

const supabase = createClient();

export async function getLeadsForReferrer(referrerId: string): Promise<ReferralLead[]> {
  const { data, error } = await supabase
    .from("webara_referral_leads")
    .select("*")
    .eq("referrer_id", referrerId)
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return data as ReferralLead[];
}

export async function getLead(leadId: string): Promise<ReferralLead | null> {
  const { data, error } = await supabase
    .from("webara_referral_leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (error) return null;
  return data as ReferralLead;
}

export async function getLeadEvents(leadId: string): Promise<LeadEvent[]> {
  const { data, error } = await supabase
    .from("webara_referral_lead_events")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data as LeadEvent[];
}

export async function getAllLeadsAdmin(): Promise<ReferralLead[]> {
  const { data, error } = await supabase
    .from("webara_referral_leads")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return data as ReferralLead[];
}

export async function checkDuplicate(phone: string, email?: string): Promise<boolean> {
  let query = supabase
    .from("webara_referral_leads")
    .select("id", { count: "exact", head: true })
    .eq("prospect_phone", phone);

  if (email) {
    query = query.or(`prospect_email.eq.${email}`);
  }

  const { count } = await query;
  return (count || 0) > 0;
}

export async function submitLead(
  referrerId: string,
  formData: LeadFormData
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from("webara_referral_leads")
    .insert({
      referrer_id: referrerId,
      prospect_name: formData.prospect_name,
      prospect_phone: formData.prospect_phone,
      prospect_email: formData.prospect_email || null,
      business_name: formData.business_name || null,
      project_type: formData.project_type,
      service_interest: formData.service_interest,
      prospect_location: formData.prospect_location,
      budget: formData.budget || null,
      description: formData.description,
      consent: formData.consent,
      note: formData.note || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function updateLeadStatus(
  leadId: string,
  newStatus: ReferralLead["status"],
  note?: string
): Promise<{ error: string | null }> {
  // Get current lead to capture from_status
  const { data: current } = await supabase
    .from("webara_referral_leads")
    .select("status")
    .eq("id", leadId)
    .single();

  if (!current) return { error: "Lead not found" };

  const updates: Record<string, unknown> = { status: newStatus };
  if (newStatus === "won") updates.won_at = new Date().toISOString();

  const { error } = await supabase
    .from("webara_referral_leads")
    .update(updates)
    .eq("id", leadId);

  if (error) return { error: error.message };

  // Insert a manual event with the note (trigger auto-creates one too, but without note)
  // Using the admin's auth.uid() via the client
  const { error: eventError } = await supabase
    .from("webara_referral_lead_events")
    .insert({
      lead_id: leadId,
      from_status: current.status as ReferralLead["status"],
      to_status: newStatus,
      note: note || `Status changed from ${current.status} to ${newStatus}`,
    });

  return { error: eventError?.message || null };
}
