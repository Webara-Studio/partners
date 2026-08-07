-- Webara Partners — approval without email invitations.
-- The applicant signs up manually with the approved application email.

alter table webara_referral_applications
  add column if not exists referral_code text;

create unique index if not exists idx_webara_referral_applications_referral_code
  on webara_referral_applications(referral_code)
  where referral_code is not null;
