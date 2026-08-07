-- Webara Partners — Stage 1 partner application workflow
-- Adds qualification fields and allows admins to review applications.

alter table webara_referral_applications
  add column if not exists profession text,
  add column if not exists partner_type text,
  add column if not exists sectors text,
  add column if not exists estimated_monthly_referrals text,
  add column if not exists referral_method text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists consent boolean not null default false;

update webara_referral_applications
set terms_accepted_at = created_at
where terms_accepted_at is null;

alter table webara_referral_applications
  alter column terms_accepted_at set not null;

create index if not exists idx_referral_applications_status
  on webara_referral_applications(review_status);

create index if not exists idx_referral_applications_created_at
  on webara_referral_applications(created_at desc);

create policy "Admins can update applications"
  on webara_referral_applications
  for update using (webara_is_admin())
  with check (webara_is_admin());
