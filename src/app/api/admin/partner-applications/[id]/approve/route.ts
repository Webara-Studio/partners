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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: "Supabase server configuration is incomplete." }, { status: 503 });
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const adminClient = createServerClient();
  const { data: authData, error: authError } = await adminClient.auth.getUser(token);
  if (authError || !authData.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data: adminProfile } = await adminClient
    .from("webara_profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();
  if (adminProfile?.role !== "admin") return NextResponse.json({ error: "Administrator access required." }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { data: application, error: applicationError } = await adminClient
    .from("webara_referral_applications")
    .select("*")
    .eq("id", id)
    .single();
  if (applicationError || !application) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  if (application.review_status !== "pending") return NextResponse.json({ error: "This application has already been reviewed." }, { status: 409 });

  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(application.email, {
    redirectTo: `${request.nextUrl.origin}/login`,
    data: { display_name: application.full_name },
  });
  if (inviteError || !inviteData.user) {
    return NextResponse.json({ error: inviteError?.message || "Unable to send the account invitation." }, { status: 502 });
  }

  const referralCode = makeReferralCode(application.full_name);
  const { error: profileError } = await adminClient
    .from("webara_profiles")
    .upsert({
      id: inviteData.user.id,
      display_name: application.full_name,
      email: application.email,
      role: "referrer",
      status: "approved",
    });
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  const { error: referrerError } = await adminClient
    .from("webara_referrer_profiles")
    .upsert({
      user_id: inviteData.user.id,
      referral_code: referralCode,
      programme_status: "approved",
      created_by_admin_id: authData.user.id,
      approved_by_admin_id: authData.user.id,
      approved_at: new Date().toISOString(),
      terms_version: "2026-08-gh-v2",
      terms_accepted_at: null,
      payout_method_status: "not_set",
    });
  if (referrerError) return NextResponse.json({ error: referrerError.message }, { status: 500 });

  const { error: applicationUpdateError } = await adminClient
    .from("webara_referral_applications")
    .update({
      review_status: "approved",
      reviewed_by: authData.user.id,
      reviewed_at: new Date().toISOString(),
      review_note: body.review_note || null,
    })
    .eq("id", id);
  if (applicationUpdateError) return NextResponse.json({ error: applicationUpdateError.message }, { status: 500 });

  return NextResponse.json({ ok: true, user_id: inviteData.user.id, referral_code: referralCode });
}
