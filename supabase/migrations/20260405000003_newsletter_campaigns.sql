-- ============================================================
-- NEWSLETTER CAMPAIGNS
-- ============================================================
create table if not exists public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  sent_at timestamptz,
  recipient_count integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'sending', 'sent', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.newsletter_campaigns enable row level security;

create policy newsletter_campaigns_select
  on public.newsletter_campaigns for select
  to authenticated using (public.is_admin());

create policy newsletter_campaigns_insert
  on public.newsletter_campaigns for insert
  to authenticated with check (public.is_admin());

create policy newsletter_campaigns_update
  on public.newsletter_campaigns for update
  to authenticated using (public.is_admin());

create policy newsletter_campaigns_delete
  on public.newsletter_campaigns for delete
  to authenticated using (public.is_admin());
