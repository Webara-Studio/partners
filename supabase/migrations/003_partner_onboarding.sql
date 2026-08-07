-- Webara Partners — Stage 2 onboarding
-- Approved partner provisioning, terms acceptance and payout preference storage.

alter table webara_referrer_profiles
  add column if not exists payout_method text,
  add column if not exists payout_account_name text,
  add column if not exists payout_account_reference text,
  add column if not exists payout_country text,
  add column if not exists payout_updated_at timestamptz;

alter table webara_referrer_profiles
  drop constraint if exists webara_referrer_profiles_payout_method_check;

alter table webara_referrer_profiles
  add constraint webara_referrer_profiles_payout_method_check
  check (payout_method is null or payout_method in ('bank_transfer', 'momo', 'other'));

create policy "Referrers can update own onboarding profile"
  on webara_referrer_profiles
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_referrer_profiles_programme_status
  on webara_referrer_profiles(programme_status);
