import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function makeReferralCode(fullName: string): string {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "") || "WEB";
  return `${initials}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return NextResponse.json({ error: "Supabase server configuration is incomplete." }, { status: 503 });

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const client = createServerClient();
  const { data: authData, error: authError } = await client.auth.getUser(token);
  if (authError || !authData.user?.email) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data: application, error: applicationError } = await client
    .from("webara_referral_applications")
    .select("*")
    .ilike("email", authData.user.email)
    .eq("review_status", "approved")
    .maybeSingle();
  if (applicationError || !application) return NextResponse.json({ error: "No approved partner application found for this account." }, { status: 404 });

  const referralCode = application.referral_code || makeReferralCode(application.full_name);
  const now = new Date().toISOString();
  const { error: profileError } = await client
    .from("webara_profiles")
    .upsert({
      id: authData.user.id,
      display_name: application.full_name,
      email: authData.user.email,
      role: "referrer",
      status: "approved",
    });
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  const { error: referrerError } = await client
    .from("webara_referrer_profiles")
    .upsert({
      user_id: authData.user.id,
      referral_code: referralCode,
      programme_status: "approved",
      approved_at: application.reviewed_at || now,
      approved_by_admin_id: application.reviewed_by,
      terms_version: "2026-08-gh-v2",
      payout_method_status: "not_set",
    }, { onConflict: "user_id" });
  if (referrerError) return NextResponse.json({ error: referrerError.message }, { status: 500 });

  if (!application.referral_code) {
    await client.from("webara_referral_applications").update({ referral_code: referralCode }).eq("id", application.id);
  }

  return NextResponse.json({ ok: true, referral_code: referralCode });
}
