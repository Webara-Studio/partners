# Webara Partners Portal

The Webara Partners Portal manages the full referral-partner lifecycle for Webara Digital:

```text
Application → Admin review → Approval → Manual account creation → Automatic partner provisioning → Onboarding → Dashboard access
```

The portal is built with Next.js, Supabase Auth and PostgreSQL. It is designed for Webara's Ghana-focused referral programme, including GHS 2,500 qualifying basic-website commissions and 20% eligible net add-on commission.

## Production

- **Live portal:** https://webara-partners-henna.vercel.app
- **Repository:** https://github.com/Webara-Studio/partners
- **Production branch:** `main`
- **Hosting:** Webara's Vercel team
- **Database:** Webara Supabase instance

## How partner activation works

### 1. Application

A prospective partner submits the public application form at:

```text
/referral-programme/apply
```

The form records the applicant's contact details, location, profession, partner type, network, referral approach, consent and terms metadata.

Anonymous users may submit an application, but they cannot read applications or partner records. The application insert deliberately does not request the inserted row back; this allows the database to keep anonymous `SELECT` access disabled.

### 2. Admin review

An administrator signs in and opens:

```text
/admin/referrers
```

The administrator can review, approve or reject applications and add a review note.

When an application is approved, the system:

- Changes `review_status` to `approved`
- Records the administrator and approval timestamp
- Generates a unique referral code
- Stores the review note
- Does **not** send an email invitation
- Does **not** create a password

### 3. Manual account creation

After approval, the applicant goes to:

```text
/login
```

They select **Create account** and choose their own password. They must use the same email address submitted on the partner application.

This avoids dependency on Supabase invitation-email delivery while retaining identity verification through the approved application email.

### 4. Automatic provisioning

After the new account signs in, the application calls:

```text
/api/auth/provision-partner
```

The server validates the Supabase Auth session and checks for an approved application with the same email address. If a match is found, it:

- Creates or updates the Webara profile
- Assigns the `referrer` role
- Marks the profile `approved`
- Creates the referrer profile
- Assigns the approval-generated referral code
- Records approval metadata
- Leaves payout setup as `not_set`

The service-role key is used only on the server route and is never exposed to the browser.

### 5. Partner onboarding

A newly provisioned partner is sent to:

```text
/portal/onboarding
```

Before ordinary dashboard use, the partner must accept the current terms and provide payout preferences. Supported payout details are governed by the onboarding form and database schema.

### 6. Dashboard access

After onboarding, the partner can access the portal and use the referral code to submit and track leads, view commissions and manage payout information.

## Commission model

- **Basic website sale:** GHS 2,500 per qualifying sale
- **Eligible add-ons:** 20% of eligible net add-on revenue actually collected
- Excludes VAT and statutory taxes, third-party costs, advertising spend, domains, payment-processing fees, refunds, credits, chargebacks and pass-through expenses
- Basic commission becomes payable only after cleared payment and the applicable refund or cancellation period

## Admin setup

The first administrator must already exist in Supabase Auth. Create the user in **Supabase → Authentication → Users**, then create or promote the matching Webara profile in the SQL Editor:

```sql
insert into public.webara_profiles (
  id,
  display_name,
  email,
  role,
  status
)
select
  id,
  coalesce(raw_user_meta_data->>'full_name', email),
  email,
  'admin',
  'approved'
from auth.users
where lower(email) = lower('ADMIN_EMAIL_HERE')
on conflict (id) do update
set
  role = 'admin',
  status = 'approved';
```

Never commit passwords, Supabase service-role keys, access tokens or connection strings.

## Environment variables

The following variables are required in the Vercel **Production** environment:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. It must not be prefixed with `NEXT_PUBLIC_` and must not be used in browser code.

## Database migrations

Apply migrations in this order, with a backup taken first:

```text
001_initial_schema.sql
002_partner_application_stage1.sql
003_partner_onboarding.sql
004_partner_privilege_hardening.sql
005_partner_manual_activation.sql
```

The migrations are scoped to the Webara Partners objects, primarily the uniquely prefixed `public.webara_*` tables. Do not run unreviewed destructive SQL against unrelated schemas.

The privilege-hardening migration ensures that:

- Anonymous users can insert applications
- Anonymous users cannot read applications or partner data
- Anonymous users cannot call the leaderboard RPC
- Authenticated access remains controlled by RLS
- Existing unrelated schemas are not broadened or altered

## Local development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Run a production build with safe placeholder values when real credentials are not available locally:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=build-placeholder \
SUPABASE_SERVICE_ROLE_KEY=build-placeholder \
npm run build
```

Run targeted linting before committing:

```bash
npx eslint src/app src/lib
```

## Testing checklist

1. Submit an application using a controlled test email.
2. Confirm the application appears in `/admin/referrers`.
3. Approve it and confirm a referral code is generated.
4. Create an account using the exact approved application email.
5. Confirm the account is provisioned as a `referrer`.
6. Confirm the user is sent to `/portal/onboarding`.
7. Accept terms and configure payout preferences.
8. Confirm `/portal` access.
9. Confirm an unauthorised user cannot access admin routes or partner records.
10. Remove test records after verification.

## Important behaviour

Approval is a commercial decision; it is not a password reset or email invitation. The applicant creates their own Auth account after approval. If the applicant already had a Supabase Auth account, their existing password remains unchanged and partner provisioning occurs the next time they sign in.
