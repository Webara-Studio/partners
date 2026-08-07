# Partner Lifecycle Runbook

This runbook explains what happens after an applicant submits the Webara Digital partner application.

## Roles

- **Applicant:** submits an application and, after approval, creates their own account.
- **Administrator:** reviews applications and decides whether to approve or reject them.
- **Referrer:** an approved partner who has completed onboarding and can use the portal.

## State transitions

```text
pending application
  ├─ reject → rejected
  └─ approve → approved application + referral code
                         ↓
                manual Auth account creation
                         ↓
                automatic referrer provisioning
                         ↓
                    onboarding required
                         ↓
                    active portal access
```

## Approving an applicant

1. Sign in at `/login` with an account whose `webara_profiles.role` is `admin`.
2. Open `/admin/referrers`.
3. Review the application carefully.
4. Approve or reject it and add a useful review note.
5. If approved, record the generated referral code if it is needed for internal communication.

Approval does not send an email and does not create a password.

## Applicant instructions after approval

Send the applicant the portal URL and tell them:

1. Open `/login`.
2. Choose **Create account**.
3. Use the exact email address from the approved application.
4. Set a password of their choice.
5. Sign in.
6. Complete the terms and payout onboarding form.

If they use a different email address, automatic provisioning will not match the approved application and they will not receive referrer access.

## Provisioning rules

The server-side provisioning route validates the Supabase Auth access token before looking up the application. It only provisions an account when:

- The Auth session is valid
- The Auth email exists
- A matching application exists
- The application status is `approved`

The route then creates or updates the Webara profile and referrer profile. It does not expose the service-role key to the browser.

## Troubleshooting

### “No approved partner application found for this account”

Check that:

- The applicant is using the same email address as the application.
- The application was approved rather than merely reviewed.
- The applicant has signed out and back in after approval.
- The application exists in the Supabase database used by the production deployment.

### “Permission denied for table webara_referral_applications”

Anonymous users require `INSERT` permission only. They must not require `SELECT` permission. The public application code must not use `.select()` after the insert.

Check the privilege hardening migration and verify:

```sql
select
  has_table_privilege('anon', 'public.webara_referral_applications', 'INSERT') as anon_can_insert,
  has_table_privilege('anon', 'public.webara_referral_applications', 'SELECT') as anon_can_select;
```

Expected result:

```text
anon_can_insert = true
anon_can_select = false
```

### Provisioning route returns 503

Check the Vercel Production environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

The service-role key must exist in Vercel but must never be placed in client-side code or shared in messages.

### Admin page is empty or inaccessible

Check that the signed-in Auth user has a matching `public.webara_profiles` record with:

```text
role = admin
status = approved
```

## Security reminders

- Never send passwords through chat or email.
- Never commit `.env` files or Supabase keys.
- Never grant anonymous read access to applications, leads, commissions or payout records.
- Take a database backup before applying migrations.
- Verify unrelated schemas before and after database changes.
