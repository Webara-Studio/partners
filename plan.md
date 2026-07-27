# Webara Studio Referral System — Implementation Plan

> **Status:** Planning complete; Supabase integration deliberately deferred.
>
> **Goal:** Add a secure referrer area to Webara Studio where approved referrers can submit leads, track lead progression and payout status, and view a private leaderboard that is visible only to authenticated referrers.

## Discovery notes

- `https://www.webarastudio.com` is currently served by a Next.js/Vercel deployment.
- The live site already exposes `/login` and `/signup` pages and describes them as Supabase-backed Webara accounts.
- `/referrals` and `/dashboard` do not currently exist on the live site.
- The public GitHub repository `Webara-Studio/webara-digital` is an older static GitHub Pages site and is **not** the source of the current Next.js/Vercel deployment. Do not implement against that repository until the live application's source repository is confirmed.
- Supabase is the intended backend, but no project credentials, schema or live integration should be added at this stage.

## Product decision

Build a **referrer portal**, not a public affiliate marketplace.

The public website should explain the programme and provide a controlled entry point. The actual referral data, lead details, pipeline history, payout information and leaderboard must remain behind authentication and authorisation.

A referrer should be able to:

1. Sign in or create an account.
2. Receive or view their referral code/link after approval.
3. Submit a lead.
4. See whether the lead is received, contacted, qualified, proposed, won, rejected or paid.
5. View their own referral history and payout totals.
6. View a private leaderboard containing referrer performance, but never private lead details belonging to other referrers.

An administrator should be able to:

1. Approve, suspend or reject referrers.
2. Review submitted leads and detect duplicates.
3. Update lead status with an audit trail.
4. Record commission eligibility and payout status.
5. Manage leaderboard display rules and programme settings.
6. Export operational data when required.

## Recommended route map

### Public routes

- `/` — existing Webara Studio marketing site.
- `/referral-programme` — programme explanation, eligibility, process and application CTA.
- `/referral-programme/apply` — application form for prospective referrers.
- `/login` — existing authentication entry point.
- `/signup` — existing account creation entry point.

### Authenticated referrer routes

- `/referrals` — referrer dashboard summary.
- `/referrals/submit` — lead submission form.
- `/referrals/leads` — the referrer’s own leads only.
- `/referrals/leads/[id]` — lead detail and status timeline for the owner.
- `/referrals/leaderboard` — private leaderboard; aggregate data only.
- `/referrals/payouts` — earned, pending and paid commissions.
- `/profile` — account and payout-preference details.

### Admin routes

- `/admin/referrals` — programme overview and lead queue.
- `/admin/referrers` — approval, suspension and profile management.
- `/admin/referrals/[id]` — lead detail, duplicate review, status changes and audit history.
- `/admin/payouts` — commission approval, payout recording and export.
- `/admin/settings/referral-programme` — commission and leaderboard rules.

## Referral lifecycle

A lead should move through an explicit state machine rather than an unrestricted status dropdown:

```text
submitted
  -> under_review
  -> contacted
  -> qualified
  -> proposal_sent
  -> won
  -> commission_eligible
  -> payout_pending
  -> paid
```

Alternative terminal or exception states:

```text
rejected
duplicate
unqualified
lost
cancelled
suspended
```

Rules:

- Only administrators can move a lead into commercial or payout states.
- A referrer can see status changes but cannot edit the status.
- Every status transition creates an immutable timeline event containing actor, previous status, new status, timestamp and optional note.
- A lead becomes commission-eligible only after the agreed commercial trigger is met. The exact trigger must be confirmed before implementation: signed agreement, cleared client payment, project launch or another approved event.
- Payout status is separate from lead status. A won lead is not automatically a paid lead.

## Lead submission design

Required fields should be deliberately limited:

- Referrer ID — assigned from the authenticated session, never accepted from the browser as authoritative.
- Prospect name.
- Prospect phone or WhatsApp number.
- Prospect email, optional where unavailable.
- Business or project name, optional.
- Service of interest.
- Prospect location or country.
- Short description of the need.
- Consent/authority confirmation that the referrer is permitted to share the prospect’s details.
- Optional supporting note.

Operational safeguards:

- The server must normalise phone numbers and email addresses before duplicate checks.
- Duplicate detection should compare normalised phone/email plus recent matching lead data.
- The UI should warn the referrer when a possible duplicate is found; it must not expose the other referrer’s identity or private details.
- A lead should have a clear duplicate-review state rather than silently disappearing.
- Do not accept payout bank details or MoMo details inside the initial lead form.

## Payout model

Use a separate commission record rather than placing payout columns directly on the lead:

- Commission ID.
- Lead ID.
- Referrer ID.
- Commission rule/version used.
- Eligible amount or percentage.
- Currency.
- Eligibility date.
- Approval status.
- Payout status.
- Paid amount.
- Paid date.
- Payment reference.
- Admin note.

Recommended payout states:

```text
not_eligible
pending_review
approved
scheduled
paid
on_hold
reversed
```

The system must preserve the commission rule used for each payout. If the programme terms change later, historical commissions must not be recalculated silently.

## Private leaderboard design

The leaderboard is private to authenticated, approved referrers. It should show aggregate performance only:

- Rank.
- Display name or approved alias.
- Qualified leads.
- Won referrals.
- Paid commissions, if the programme chooses to show this.
- Current period or all-time indicator.

Do not show:

- Prospect names.
- Prospect phone numbers or emails.
- Project descriptions.
- Individual commission records belonging to other referrers.
- Unapproved or suspended referrers.

The leaderboard should support a defined period:

- Current month.
- Current quarter.
- Current programme year.
- All time.

Recommended initial policy: show qualified or won referrals rather than raw submissions, so the leaderboard rewards useful business rather than volume-spamming.

## Proposed Supabase data model

These are design targets for a later migration, not a request to create the database now.

### `profiles`

- `id` — references `auth.users.id`.
- `display_name`.
- `role` — `user`, `referrer`, `admin`.
- `status` — `active`, `pending`, `suspended`.
- `created_at`, `updated_at`.

### `referrer_profiles`

- `user_id` — primary key and profile reference.
- `referral_code` — unique, non-sensitive public identifier.
- `programme_status` — `pending`, `approved`, `suspended`, `rejected`.
- `approved_at`, `approved_by`.
- `payout_method_status` — do not store sensitive payment data in plain text.
- `terms_version`, `terms_accepted_at`.

### `referral_leads`

- `id`.
- `referrer_id`.
- Prospect contact fields.
- Service and location fields.
- `status`.
- `duplicate_of`, nullable.
- `submitted_at`, `updated_at`.
- `assigned_admin_id`.

### `referral_lead_events`

- `id`.
- `lead_id`.
- `actor_id`.
- `from_status`.
- `to_status`.
- `note`.
- `created_at`.

### `referral_commissions`

- Commission and payout fields described above.
- `programme_rule_version`.
- `created_at`, `updated_at`.

### `referral_payouts`

- `id`.
- `referrer_id`.
- `amount`.
- `currency`.
- `status`.
- `payment_reference`.
- `paid_at`.
- `processed_by`.
- `created_at`.

### `referral_applications`

- Applicant identity and contact details.
- Motivation or network description.
- Review status.
- Reviewer and review note.
- Terms version and consent timestamp.

### `referral_programme_settings`

- Active programme name.
- Commission rule version.
- Eligibility trigger.
- Leaderboard metric.
- Current period dates.
- Updated by and updated timestamp.

## Security and access rules

- Authentication uses the existing Supabase Auth implementation once the source repository is confirmed.
- The browser must never be trusted to supply `user_id`, `referrer_id`, role or payout status.
- Referrers can read and update only their own profile-level information and read their own leads, lead events and commissions.
- Referrers can read an aggregate leaderboard view only; they cannot query the raw leads or commissions of other referrers.
- Admin privileges must be enforced server-side and through Supabase RLS, not merely by hiding admin links.
- Service-role keys must never be shipped to the browser or committed to the repository.
- Lead contact data is personal data. Include consent language, access controls, retention rules and a privacy-policy update before launch.
- Add rate limiting, anti-spam controls and duplicate protection to lead submission.
- Keep an audit trail for administrative status and payout actions.

## Frontend preparation before Supabase

The build can safely proceed without live Supabase by creating:

1. The referral programme public page.
2. Authenticated-route shells using a mock session provider.
3. Referrer dashboard layouts with clearly labelled prototype data.
4. Lead submission form and client-side validation.
5. Lead table and status timeline components.
6. Private leaderboard component with mock aggregate records.
7. Payout summary and history components.
8. Admin lead queue and payout screens using mock data.
9. Shared TypeScript types and validation schemas.
10. Repository documentation defining the Supabase contract.

Mock data must be visually labelled as prototype data and must not imply that real leads, rankings or payouts exist.

## Delivery phases

### Phase 0 — Source and product confirmation

- Confirm the actual Git repository and Vercel project powering `www.webarastudio.com`.
- Confirm whether the current `/login` and `/signup` routes are already connected to a real Supabase project or are only UI shells.
- Confirm referrer eligibility, commission amount/rule, payout trigger, payout frequency, currencies and dispute rules.
- Confirm whether leaderboard names use legal names, display names or aliases.

### Phase 1 — Frontend contract and route shells

- Add shared referral types and status constants.
- Add route protection interfaces using a mock auth/session adapter.
- Add public referral programme and application pages.
- Add referrer and admin layouts with empty/loading/error states.
- Add navigation that is hidden or disabled when a user is not authorised.

### Phase 2 — Referrer experience

- Build lead submission form.
- Build own-leads list and detail timeline.
- Build payout summary/history.
- Build private leaderboard with period selector and aggregate-only rows.
- Add clear status explanations and support/contact escalation.

### Phase 3 — Admin experience

- Build referrer approval queue.
- Build lead queue with duplicate-review handling.
- Build status transition controls and audit timeline.
- Build commission and payout review screens.
- Add CSV export only after access controls and data minimisation are tested.

### Phase 4 — Supabase integration

- Create migrations for the agreed schema.
- Add RLS policies and aggregate leaderboard view/function.
- Connect the frontend through a server-safe Supabase client pattern.
- Replace mock session/data adapters with real adapters.
- Add server-side validation, duplicate detection and status-transition rules.
- Configure email/WhatsApp notifications only after consent and operational ownership are confirmed.

### Phase 5 — Pilot and verification

- Test with one admin and a small group of approved referrers.
- Submit test leads through every status and payout path.
- Verify that one referrer cannot read another referrer’s lead details.
- Verify suspended users lose access.
- Verify historical payout records retain their rule version.
- Confirm leaderboard aggregation does not leak personal information.
- Review mobile usability, especially lead submission and status tracking.

## Explicitly not in the first build

- Automatic payouts.
- Public leaderboard.
- Public lead directory.
- Scraping or importing leads from third-party platforms.
- Client access to private project-management pages.
- Complex multi-level affiliate commissions.
- Cryptocurrency or token-based rewards.
- Unverified construction/project claims.

These are deferred because they add legal, privacy, reconciliation or operational complexity before the basic referral loop is proven.

## Acceptance criteria

The implementation is ready for launch only when:

- An approved referrer can submit a lead from a phone.
- The lead is attributable to the authenticated referrer without trusting browser-supplied IDs.
- The referrer can see only their own lead details and timeline.
- An admin can move a lead through controlled statuses with an audit record.
- Commission eligibility and payout status are separate and visible.
- The leaderboard is accessible only after authentication and approval.
- The leaderboard contains aggregate metrics only.
- RLS and server-side checks prevent cross-referrer data access.
- Privacy, consent and referral terms are visible before lead submission.
- Mock data is removed or replaced by live data before production launch.

## Confirmed programme rules

The following rules are now approved for the first version:

1. **Referrer access:** An administrator adds and manages referrers. There is no open public self-approval route. A prospective referrer may have an application or invitation flow later, but only an admin-approved account becomes an active referrer.
2. **Commission trigger:** A referral becomes commission-eligible only after the client has completed payment for the website or application project. A proposal, signed agreement or verbal commitment is not sufficient.
3. **Commission model:** The commission is fixed. The exact fixed amount must be stored against the referral or commission record so future programme changes cannot alter historical entitlements.
4. **Payout method:** Payouts are processed manually. The admin records the payout in Supabase with payout date, amount, method, processor and a receipt or proof-of-payment link.
5. **Leaderboard metric:** Version one ranks referrers by won projects. A future version may rank by paid commissions, but payment-based ranking is not required for the initial release.

## Updated first-version state model

The lead pipeline remains:

```text
submitted
  -> under_review
  -> contacted
  -> qualified
  -> proposal_sent
  -> won
```

Payment and commission are tracked separately:

```text
won
  -> payment_pending
  -> payment_completed
  -> commission_eligible
  -> payout_pending
  -> paid
```

Exception states remain available where appropriate:

```text
rejected
duplicate
unqualified
lost
cancelled
suspended
on_hold
reversed
```

Rules for the updated model:

- Only an admin can approve a referrer.
- Only an admin can mark a project payment as completed.
- A referral cannot become `commission_eligible` until payment completion has been recorded.
- The fixed commission amount and rule version are copied onto the commission record when eligibility is confirmed.
- Recording a payment completion does not automatically mark the payout as paid.
- An admin must manually create or complete the payout record and attach a receipt/proof-of-payment link.
- The leaderboard counts projects in the `won` state. The implementation should make the metric configurable so it can later switch to paid commissions without redesigning the portal.

## Updated data-model additions

Add the following fields or records to the later Supabase design:

### `referrer_profiles`

- `programme_status` — `pending`, `approved`, `suspended`, `rejected`.
- `created_by_admin_id`.
- `approved_by_admin_id`.
- `approved_at`.

### `referral_leads`

- `project_type` — `website`, `web_app`, or another approved service category.
- `won_at`.
- `payment_status` — `not_due`, `pending`, `completed`, `refunded`.
- `payment_completed_at`.
- `payment_recorded_by`.

### `referral_commissions`

- `fixed_amount`.
- `currency`.
- `rule_version`.
- `eligibility_reason` — for example, `website_payment_completed` or `web_app_payment_completed`.
- `eligible_at`.

### `referral_payouts`

- `commission_id`.
- `amount`.
- `currency`.
- `method` — for example, bank transfer, MoMo or another approved manual method.
- `status` — `pending`, `paid`, `on_hold`, `reversed`.
- `paid_at`.
- `recorded_by_admin_id`.
- `receipt_url`.
- `receipt_label`.
- `admin_note`.

Receipt links should point to controlled storage or an approved document location. Do not expose receipt URLs to other referrers through the leaderboard.

## Updated admin workflow

1. Admin creates a referrer account or approves an existing account.
2. The system generates or assigns a unique referral code.
3. Referrer submits a website or web-app lead.
4. Admin reviews the lead and resolves any duplicate warning.
5. Admin progresses the lead through the sales pipeline.
6. Admin marks the project as won when the project is accepted.
7. Admin records completion of the client payment.
8. The system creates a fixed-amount commission marked `commission_eligible`.
9. Admin manually pays the referrer.
10. Admin records payout method, date, amount and receipt link.
11. The referrer sees the updated payout status in their private portal.

## Revised immediate next decision

The remaining commercial decision before implementation is the fixed commission schedule:

- Is there one fixed amount for every project?
- Or are there separate fixed amounts for websites and web applications?

My recommended structure is two fixed values — one for websites and one for web applications — because the project values, sales cycles and delivery effort are likely to differ. The system can still present this as a simple fixed-commission programme to referrers.
