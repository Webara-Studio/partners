-- ============================================================
-- Webara Partners — Supabase Migration
-- Referral management system for Webara Studio
-- ============================================================

-- EXTENSIONS
create extension if not exists "uuid-ossp";

-- ─── ENUMS ─────────────────────────────────────────────────

create type webara_user_role as enum ('user', 'referrer', 'admin');
create type webara_referrer_status as enum ('pending', 'approved', 'suspended', 'rejected');
create type webara_lead_status as enum (
  'submitted', 'under_review', 'contacted', 'qualified', 'proposal_sent', 'won',
  'rejected', 'duplicate', 'unqualified', 'lost', 'cancelled'
);
create type webara_payment_status as enum ('not_due', 'pending', 'completed', 'refunded');
create type webara_project_type as enum ('website', 'web_app', 'other');
create type webara_commission_status as enum (
  'not_eligible', 'pending_review', 'approved', 'scheduled', 'paid', 'on_hold', 'reversed'
);
create type webara_payout_status as enum ('pending', 'paid', 'on_hold', 'reversed');
create type webara_payout_method as enum ('bank_transfer', 'momo', 'other');

-- ─── PROFILES ──────────────────────────────────────────────
-- Uses webara_ prefix to avoid collision with Supabase agents' profiles table

create table if not exists webara_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email       text not null,
  role        webara_user_role not null default 'user',
  status      webara_referrer_status not null default 'pending',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── REFERRER PROFILES ────────────────────────────────────

create table if not exists webara_referrer_profiles (
  user_id              uuid primary key references webara_profiles(id) on delete cascade,
  referral_code        text not null unique,
  programme_status     webara_referrer_status not null default 'pending',
  created_by_admin_id  uuid references webara_profiles(id),
  approved_by_admin_id uuid references webara_profiles(id),
  approved_at          timestamptz,
  terms_version        text not null default '2026-01-v1',
  terms_accepted_at    timestamptz,
  payout_method_status text not null default 'not_set' check (payout_method_status in ('not_set','pending','verified')),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ─── REFERRAL APPLICATIONS ────────────────────────────────

create table if not exists webara_referral_applications (
  id                  uuid primary key default uuid_generate_v4(),
  full_name           text not null,
  email               text not null,
  phone               text not null,
  location            text not null,
  network_description text not null,
  how_did_you_hear    text,
  terms_version       text not null default '2026-01-v1',
  review_status       webara_referrer_status not null default 'pending',
  reviewed_by         uuid references webara_profiles(id),
  reviewed_at         timestamptz,
  review_note         text,
  created_at          timestamptz not null default now()
);

-- ─── REFERRAL LEADS ───────────────────────────────────────

create table if not exists webara_referral_leads (
  id                    uuid primary key default uuid_generate_v4(),
  referrer_id           uuid not null references webara_profiles(id) on delete cascade,
  prospect_name         text not null,
  prospect_phone        text not null,
  prospect_email        text,
  business_name         text,
  project_type          webara_project_type not null default 'website',
  service_interest      text not null,
  prospect_location     text not null,
  budget                text,
  description           text not null,
  consent               boolean not null default false,
  note                  text,
  status                webara_lead_status not null default 'submitted',
  payment_status        webara_payment_status not null default 'not_due',
  duplicate_of          uuid references webara_referral_leads(id),
  assigned_admin_id     uuid references webara_profiles(id),
  won_at                timestamptz,
  payment_completed_at  timestamptz,
  payment_recorded_by   uuid references webara_profiles(id),
  submitted_at          timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_leads_referrer on webara_referral_leads(referrer_id);
create index if not exists idx_leads_status on webara_referral_leads(status);
create index if not exists idx_leads_phone on webara_referral_leads(prospect_phone);

-- ─── LEAD EVENTS (AUDIT TRAIL) ────────────────────────────

create table if not exists webara_referral_lead_events (
  id          uuid primary key default uuid_generate_v4(),
  lead_id     uuid not null references webara_referral_leads(id) on delete cascade,
  actor_id    uuid not null references webara_profiles(id),
  from_status webara_lead_status,
  to_status   webara_lead_status not null,
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_events_lead on webara_referral_lead_events(lead_id);

-- ─── COMMISSIONS ──────────────────────────────────────────

create table if not exists webara_referral_commissions (
  id               uuid primary key default uuid_generate_v4(),
  lead_id          uuid not null references webara_referral_leads(id) on delete cascade,
  referrer_id      uuid not null references webara_profiles(id) on delete cascade,
  fixed_amount     integer not null,
  currency         text not null default 'USD',
  rule_version     text not null,
  status           webara_commission_status not null default 'not_eligible',
  eligibility_reason text,
  eligible_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_commissions_referrer on webara_referral_commissions(referrer_id);
create index if not exists idx_commissions_lead on webara_referral_commissions(lead_id);

-- ─── PAYOUTS ──────────────────────────────────────────────

create table if not exists webara_referral_payouts (
  id                    uuid primary key default uuid_generate_v4(),
  commission_id         uuid not null references webara_referral_commissions(id) on delete cascade,
  referrer_id           uuid not null references webara_profiles(id) on delete cascade,
  amount                integer not null,
  currency              text not null default 'USD',
  method                webara_payout_method not null default 'bank_transfer',
  status                webara_payout_status not null default 'pending',
  paid_at               timestamptz,
  recorded_by_admin_id  uuid references webara_profiles(id),
  receipt_url           text,
  receipt_label         text,
  admin_note            text,
  created_at            timestamptz not null default now()
);

create index if not exists idx_payouts_referrer on webara_referral_payouts(referrer_id);

-- ─── UPDATED_AT TRIGGERS ──────────────────────────────────

create or replace function webara_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger webara_profiles_updated_at before update on webara_profiles
  for each row execute function webara_set_updated_at();

create trigger webara_referrer_profiles_updated_at before update on webara_referrer_profiles
  for each row execute function webara_set_updated_at();

create trigger webara_leads_updated_at before update on webara_referral_leads
  for each row execute function webara_set_updated_at();

create trigger webara_commissions_updated_at before update on webara_referral_commissions
  for each row execute function webara_set_updated_at();

-- ─── AUTO-CREATE PROFILE ON SIGNUP ────────────────────────

create or replace function webara_handle_new_user()
returns trigger as $$
begin
  insert into webara_profiles (id, display_name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email,
    'user',
    'pending'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists webara_on_auth_user_created on auth.users;
create trigger webara_on_auth_user_created
  after insert on auth.users
  for each row execute function webara_handle_new_user();

-- ─── LEAD STATUS TRANSITION TRIGGER ───────────────────────
-- Auto-creates an audit event when lead status changes

create or replace function webara_log_lead_transition()
returns trigger as $$
begin
  if new.status is distinct from old.status then
    insert into webara_referral_lead_events (lead_id, actor_id, from_status, to_status)
    values (new.id, auth.uid(), old.status, new.status);
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists webara_lead_transition on webara_referral_leads;
create trigger webara_lead_transition
  after update of status on webara_referral_leads
  for each row execute function webara_log_lead_transition();

-- ─── RLS POLICIES ─────────────────────────────────────────

alter table webara_profiles enable row level security;
alter table webara_referrer_profiles enable row level security;
alter table webara_referral_applications enable row level security;
alter table webara_referral_leads enable row level security;
alter table webara_referral_lead_events enable row level security;
alter table webara_referral_commissions enable row level security;
alter table webara_referral_payouts enable row level security;

-- Helper: is current user an admin?
create or replace function webara_is_admin()
returns boolean as $$
  select exists(
    select 1 from webara_profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- PROFILES: users can read/update own, admins can read all
create policy "Users can read own profile" on webara_profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on webara_profiles
  for update using (auth.uid() = id);

-- REFERRER PROFILES: users read own, admins read all
create policy "Users read own referrer profile" on webara_referrer_profiles
  for select using (auth.uid() = user_id or webara_is_admin());

-- APPLICATIONS: anyone can insert, only admins can read
create policy "Anyone can submit application" on webara_referral_applications
  for insert with check (true);
create policy "Admins can read applications" on webara_referral_applications
  for select using (webara_is_admin());

-- LEADS: referrer reads/inserts own, admins see all
create policy "Referrer reads own leads" on webara_referral_leads
  for select using (auth.uid() = referrer_id or webara_is_admin());
create policy "Referrer inserts own leads" on webara_referral_leads
  for insert with check (auth.uid() = referrer_id);
create policy "Admins update leads" on webara_referral_leads
  for update using (webara_is_admin());

-- EVENTS: referrer reads own lead events, admins see all
create policy "Referrer reads own lead events" on webara_referral_lead_events
  for select using (
    exists(
      select 1 from webara_referral_leads l
      where l.id = webara_referral_lead_events.lead_id
      and l.referrer_id = auth.uid()
    ) or webara_is_admin()
  );
create policy "Admins insert lead events" on webara_referral_lead_events
  for insert with check (webara_is_admin());

-- COMMISSIONS: referrer reads own, admins see all/update
create policy "Referrer reads own commissions" on webara_referral_commissions
  for select using (auth.uid() = referrer_id or webara_is_admin());
create policy "Admins manage commissions" on webara_referral_commissions
  for all using (webara_is_admin());

-- PAYOUTS: referrer reads own, admins see all/update
create policy "Referrer reads own payouts" on webara_referral_payouts
  for select using (auth.uid() = referrer_id or webara_is_admin());
create policy "Admins manage payouts" on webara_referral_payouts
  for all using (webara_is_admin());

-- ─── LEADERBOARD RPC ──────────────────────────────────────
-- Aggregate view — returns display names + counts only.
-- No prospect data, no raw commission amounts to non-admins.

create or replace function webara_get_leaderboard()
returns table (
  rank integer,
  display_name text,
  qualified_leads bigint,
  won_referrals bigint,
  total_payout integer,
  currency text
) as $$
  with stats as (
    select
      p.display_name,
      count(*) filter (where l.status in ('qualified','proposal_sent','won')) as qualified_leads,
      count(*) filter (where l.status = 'won') as won_referrals,
      coalesce(sum(payouts.amount), 0) as total_payout
    from webara_profiles p
    join webara_referrer_profiles rp on rp.user_id = p.id
    left join webara_referral_leads l on l.referrer_id = p.id
    left join webara_referral_payouts payouts on payouts.referrer_id = p.id and payouts.status = 'paid'
    where rp.programme_status = 'approved'
    group by p.id, p.display_name
  )
  select
    row_number() over (order by won_referrals desc, qualified_leads desc) as rank,
    display_name,
    qualified_leads,
    won_referrals,
    total_payout,
    'USD'::text as currency
  from stats
  order by rank;
$$ language sql security definer;
