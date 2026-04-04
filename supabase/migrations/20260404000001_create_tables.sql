-- ============================================================
-- 1. PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text,
  bio text,
  photo_url text,
  contact_info jsonb default '{}'::jsonb,
  social_links jsonb default '{}'::jsonb,
  skills text[] default '{}',
  certifications jsonb[] default '{}',
  resume_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 2. BLOG POSTS
-- ============================================================
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  featured_image text,
  body text,
  category text,
  tags text[] default '{}',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  is_published boolean not null default false,
  reading_time_min integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 3. CASE STUDIES
-- ============================================================
create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_name text,
  industry text,
  challenge text,
  strategy text,
  result text,
  kpi_metrics jsonb default '{}'::jsonb,
  images text[] default '{}',
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 4. SERVICES
-- ============================================================
create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  features text[] default '{}',
  price numeric,
  cta_label text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 5. TESTIMONIALS
-- ============================================================
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  quote text not null,
  avatar_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 6. MARKET INSIGHTS
-- ============================================================
create table public.market_insights (
  id uuid primary key default gen_random_uuid(),
  asset_name text not null,
  sector text,
  thesis_summary text,
  risks text,
  target_price numeric,
  time_horizon text,
  charts jsonb default '[]'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 7. NEWSLETTER SUBSCRIBERS
-- ============================================================
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now(),
  is_active boolean not null default true
);

-- ============================================================
-- 8. CONTACT SUBMISSIONS
-- ============================================================
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

-- ============================================================
-- 9. MEDIA APPEARANCES
-- ============================================================
create table public.media_appearances (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  outlet text,
  url text,
  date date,
  type text check (type in ('article', 'podcast', 'video')),
  thumbnail_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 10. CAREER TIMELINE
-- ============================================================
create table public.career_timeline (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  title text not null,
  organization text,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'blog_posts', 'case_studies', 'services',
    'testimonials', 'market_insights', 'media_appearances', 'career_timeline'
  ] loop
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.handle_updated_at()',
      t
    );
  end loop;
end;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.blog_posts enable row level security;
alter table public.case_studies enable row level security;
alter table public.services enable row level security;
alter table public.testimonials enable row level security;
alter table public.market_insights enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.media_appearances enable row level security;
alter table public.career_timeline enable row level security;

-- Helper: check if the current user has the 'admin' role claim in JWT
create or replace function public.is_admin()
returns boolean as $$
begin
  return coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
end;
$$ language plpgsql stable security definer;

-- --------------------------------------------------------
-- PUBLIC-READ tables (website content)
-- Anyone can SELECT; only admin can INSERT/UPDATE/DELETE
-- --------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'blog_posts', 'case_studies', 'services',
    'testimonials', 'market_insights', 'media_appearances', 'career_timeline'
  ] loop
    -- public read
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      t || '_select', t
    );
    -- admin insert
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_admin())',
      t || '_insert', t
    );
    -- admin update
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.is_admin())',
      t || '_update', t
    );
    -- admin delete
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.is_admin())',
      t || '_delete', t
    );
  end loop;
end;
$$;

-- --------------------------------------------------------
-- NEWSLETTER SUBSCRIBERS — anon can insert (subscribe),
-- only admin can read/update/delete
-- --------------------------------------------------------
create policy newsletter_subscribers_insert
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

create policy newsletter_subscribers_select
  on public.newsletter_subscribers for select
  to authenticated
  using (public.is_admin());

create policy newsletter_subscribers_update
  on public.newsletter_subscribers for update
  to authenticated
  using (public.is_admin());

create policy newsletter_subscribers_delete
  on public.newsletter_subscribers for delete
  to authenticated
  using (public.is_admin());

-- --------------------------------------------------------
-- CONTACT SUBMISSIONS — anon can insert (submit form),
-- only admin can read/update/delete
-- --------------------------------------------------------
create policy contact_submissions_insert
  on public.contact_submissions for insert
  to anon, authenticated
  with check (true);

create policy contact_submissions_select
  on public.contact_submissions for select
  to authenticated
  using (public.is_admin());

create policy contact_submissions_update
  on public.contact_submissions for update
  to authenticated
  using (public.is_admin());

create policy contact_submissions_delete
  on public.contact_submissions for delete
  to authenticated
  using (public.is_admin());
