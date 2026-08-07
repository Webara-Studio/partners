-- Webara Partners — privilege hardening for the isolated webara_* tables.
-- Do not broaden or alter privileges for other schemas or public Webara project tables.

revoke all privileges on table
  webara_profiles,
  webara_referrer_profiles,
  webara_referral_applications,
  webara_referral_leads,
  webara_referral_lead_events,
  webara_referral_commissions,
  webara_referral_payouts
from anon;

revoke all privileges on table
  webara_profiles,
  webara_referrer_profiles,
  webara_referral_applications,
  webara_referral_leads,
  webara_referral_lead_events,
  webara_referral_commissions,
  webara_referral_payouts
from authenticated;

grant insert on table webara_referral_applications to anon;

grant select, update on table webara_profiles to authenticated;
grant select, update on table webara_referrer_profiles to authenticated;
grant select, update on table webara_referral_applications to authenticated;
grant select, insert, update on table webara_referral_leads to authenticated;
grant select, insert on table webara_referral_lead_events to authenticated;
grant select, insert, update on table webara_referral_commissions to authenticated;
grant select, insert, update on table webara_referral_payouts to authenticated;

revoke execute on function webara_get_leaderboard() from public, anon;
grant execute on function webara_get_leaderboard() to authenticated;
