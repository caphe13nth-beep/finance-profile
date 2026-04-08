-- ================================================================
-- COMPLETE DATABASE SETUP — Run this in Supabase SQL Editor
-- ================================================================

-- ============================================================
-- HELPER FUNCTION: updated_at trigger
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- HELPER FUNCTION: is_admin check
-- ============================================================
create or replace function public.is_admin()
returns boolean as $$
begin
  return coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
end;
$$ language plpgsql stable security definer;

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
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
-- 2. BLOG POSTS (with status + view_count)
-- ============================================================
create table if not exists public.blog_posts (
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
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'archived')),
  scheduled_at timestamptz,
  view_count integer not null default 0,
  reading_time_min integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 3. CASE STUDIES
-- ============================================================
create table if not exists public.case_studies (
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
create table if not exists public.services (
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
create table if not exists public.testimonials (
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
create table if not exists public.market_insights (
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
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now(),
  is_active boolean not null default true
);

-- ============================================================
-- 8. CONTACT SUBMISSIONS
-- ============================================================
create table if not exists public.contact_submissions (
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
create table if not exists public.media_appearances (
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
create table if not exists public.career_timeline (
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
-- 11. RESOURCES
-- ============================================================
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null check (type in ('whitepaper', 'template', 'guide', 'report', 'other')),
  file_path text not null,
  thumbnail_url text,
  is_gated boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 12. SITE SETTINGS
-- ============================================================
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 13. PERSONAL PROJECTS
-- ============================================================
create table if not exists public.personal_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  image_url text,
  link text,
  tags text[] default '{}',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 14. PHOTO GALLERY
-- ============================================================
create table if not exists public.photo_gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  category text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 15. HOBBIES & INTERESTS
-- ============================================================
create table if not exists public.hobbies_interests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  image_url text,
  sort_order integer not null default 0
);

-- ============================================================
-- 16. BLOG REACTIONS
-- ============================================================
create table if not exists public.blog_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  reaction text not null check (reaction in ('like', 'insightful', 'fire', 'bookmark')),
  visitor_id text not null,
  created_at timestamptz not null default now(),
  unique (post_id, reaction, visitor_id)
);

create index if not exists blog_reactions_post_id_idx on public.blog_reactions(post_id);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'blog_posts', 'case_studies', 'services',
    'testimonials', 'market_insights', 'media_appearances',
    'career_timeline', 'resources', 'site_settings'
  ] loop
    begin
      execute format(
        'create trigger set_updated_at before update on public.%I
         for each row execute function public.handle_updated_at()',
        t
      );
    exception when duplicate_object then null;
    end;
  end loop;
end;
$$;

-- ============================================================
-- ROW LEVEL SECURITY — Enable on all tables
-- ============================================================
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
alter table public.resources enable row level security;
alter table public.site_settings enable row level security;
alter table public.personal_projects enable row level security;
alter table public.photo_gallery enable row level security;
alter table public.hobbies_interests enable row level security;
alter table public.blog_reactions enable row level security;

-- ============================================================
-- RLS POLICIES — Public-read content tables
-- ============================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'blog_posts', 'case_studies', 'services',
    'testimonials', 'market_insights', 'media_appearances',
    'career_timeline', 'resources', 'site_settings',
    'personal_projects', 'photo_gallery', 'hobbies_interests'
  ] loop
    begin
      execute format('create policy %I on public.%I for select to anon, authenticated using (true)', t || '_select', t);
    exception when duplicate_object then null;
    end;
    begin
      execute format('create policy %I on public.%I for insert to authenticated with check (public.is_admin())', t || '_insert', t);
    exception when duplicate_object then null;
    end;
    begin
      execute format('create policy %I on public.%I for update to authenticated using (public.is_admin())', t || '_update', t);
    exception when duplicate_object then null;
    end;
    begin
      execute format('create policy %I on public.%I for delete to authenticated using (public.is_admin())', t || '_delete', t);
    exception when duplicate_object then null;
    end;
  end loop;
end;
$$;

-- Newsletter + Contact: anon can insert
do $$
begin
  begin
    create policy newsletter_subscribers_anon_insert on public.newsletter_subscribers for insert to anon, authenticated with check (true);
  exception when duplicate_object then null;
  end;
  begin
    create policy contact_submissions_anon_insert on public.contact_submissions for insert to anon, authenticated with check (true);
  exception when duplicate_object then null;
  end;
end;
$$;

-- Blog reactions: public can insert + delete own
do $$
begin
  begin
    create policy blog_reactions_select on public.blog_reactions for select to anon, authenticated using (true);
  exception when duplicate_object then null;
  end;
  begin
    create policy blog_reactions_insert on public.blog_reactions for insert to anon, authenticated with check (true);
  exception when duplicate_object then null;
  end;
  begin
    create policy blog_reactions_delete on public.blog_reactions for delete to anon, authenticated using (true);
  exception when duplicate_object then null;
  end;
end;
$$;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('avatars',           'avatars',           true),
  ('blog-images',       'blog-images',       true),
  ('documents',         'documents',         true),
  ('case-study-assets', 'case-study-assets', true)
on conflict (id) do nothing;

-- Storage RLS
do $$
declare
  bucket text;
begin
  foreach bucket in array array['avatars', 'blog-images', 'documents', 'case-study-assets'] loop
    begin
      execute format('create policy %I on storage.objects for select to anon, authenticated using (bucket_id = %L)', bucket || '_select', bucket);
    exception when duplicate_object then null;
    end;
    begin
      execute format('create policy %I on storage.objects for insert to authenticated with check (bucket_id = %L and public.is_admin())', bucket || '_insert', bucket);
    exception when duplicate_object then null;
    end;
    begin
      execute format('create policy %I on storage.objects for update to authenticated using (bucket_id = %L and public.is_admin())', bucket || '_update', bucket);
    exception when duplicate_object then null;
    end;
    begin
      execute format('create policy %I on storage.objects for delete to authenticated using (bucket_id = %L and public.is_admin())', bucket || '_delete', bucket);
    exception when duplicate_object then null;
    end;
  end loop;
end;
$$;

-- ============================================================
-- SEED SITE SETTINGS (only if not already present)
-- ============================================================
insert into public.site_settings (key, value) values
('section_visibility', '{"hero":true,"stats_bar":true,"latest_insights":true,"featured_case_study":true,"career_timeline":true,"testimonials":true,"newsletter_cta":true,"services_preview":true,"media_appearances":true,"personal_intro":true,"photo_gallery":true,"hobbies":true,"personal_projects":true,"what_i_do":true,"now_section":true,"finance_ticker":false,"calculators":false,"market_insights":false}'::jsonb)
on conflict (key) do nothing;

insert into public.site_settings (key, value) values
('page_visibility', '{"about":true,"services":true,"portfolio":true,"blog":true,"contact":true,"resources":false,"tools":false,"market_insights":false}'::jsonb)
on conflict (key) do nothing;

insert into public.site_settings (key, value) values
('site_identity', '{"site_name":"Your Name","tagline":"Finance Professional & Advisor","logo_url":null,"favicon_url":null,"og_image_url":null,"avatar_url":null,"cover_image_url":null,"avatar_shape":"squircle","cover_overlay":"gradient-mesh","site_mode":"hybrid","footer_text":"© 2026 Your Name. All rights reserved."}'::jsonb)
on conflict (key) do nothing;

insert into public.site_settings (key, value) values
('seo_defaults', '{"title_template":"%s | Your Name","default_description":"Personal profile and finance insights","google_analytics_id":"","posthog_key":""}'::jsonb)
on conflict (key) do nothing;

insert into public.site_settings (key, value) values
('hero_content', '{"heading":"Your Name","subheading":"Finance Professional & Advisor","description":"Helping businesses and investors make smarter financial decisions.","cta_primary_text":"View Insights","cta_primary_link":"/blog","cta_secondary_text":"Book a Consultation","cta_secondary_link":"/contact","show_cta_tertiary":true,"cta_tertiary_text":"Download CV","background_style":"grid"}'::jsonb)
on conflict (key) do nothing;

insert into public.site_settings (key, value) values
('stats_bar', '{"stats":[{"label":"Years Experience","value":12,"suffix":"+","prefix":"","icon":"clock"},{"label":"Assets Managed","value":50,"suffix":"M+","prefix":"$","icon":"trending-up"},{"label":"Clients","value":200,"suffix":"+","prefix":"","icon":"users"},{"label":"Articles","value":85,"suffix":"","prefix":"","icon":"file-text"},{"label":"Avg ROI","value":18,"suffix":"%","prefix":"","icon":"bar-chart"}]}'::jsonb)
on conflict (key) do nothing;

insert into public.site_settings (key, value) values
('social_links', '{"linkedin":"","twitter":"","youtube":"","medium":"","github":"","instagram":"","tiktok":"","facebook":""}'::jsonb)
on conflict (key) do nothing;

insert into public.site_settings (key, value) values
('now_section', '{"last_updated":"2026-04-04","items":[{"emoji":"📈","text":"Building investment strategies for Q2 2026"},{"emoji":"✍️","text":"Writing a series on macro-economic trends"},{"emoji":"🎙️","text":"Guest appearances on finance podcasts"},{"emoji":"📚","text":"Reading: The Psychology of Money by Morgan Housel"}]}'::jsonb)
on conflict (key) do nothing;

insert into public.site_settings (key, value) values
('theme', '{"preset":"finance-dark","colors":{"primary":"#0F172A","secondary":"#E2E8F0","background":"#F8FAFC","accent":"#10B981","accent_secondary":"#D4A373","card_bg":"#FFFFFF","text_primary":"#0F172A","text_secondary":"#64748B","border":"#E2E8F0"},"dark_colors":{"primary":"#F8FAFC","secondary":"#334155","background":"#0F172A","accent":"#10B981","accent_secondary":"#D4A373","card_bg":"#1E293B","text_primary":"#F8FAFC","text_secondary":"#94A3B8","border":"rgba(248, 250, 252, 0.1)"},"fonts":{"heading":"Space Grotesk","body":"Manrope","mono":"JetBrains Mono"},"border_radius":"0.625rem","enable_dark_mode_toggle":true,"default_dark":true}'::jsonb)
on conflict (key) do nothing;
