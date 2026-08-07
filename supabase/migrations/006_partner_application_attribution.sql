-- Webara Partners — application attribution fields.

alter table webara_referral_applications
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists landing_page text;
