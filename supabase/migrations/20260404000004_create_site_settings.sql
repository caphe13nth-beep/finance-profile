-- ============================================================
-- SITE SETTINGS — key/value config store
-- ============================================================

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.site_settings
  for each row execute function public.handle_updated_at();

-- ── RLS ────────────────────────────────────────────
alter table public.site_settings enable row level security;

-- Public can read all settings
create policy site_settings_select
  on public.site_settings for select
  to anon, authenticated
  using (true);

-- Only admin can insert
create policy site_settings_insert
  on public.site_settings for insert
  to authenticated
  with check (public.is_admin());

-- Only admin can update
create policy site_settings_update
  on public.site_settings for update
  to authenticated
  using (public.is_admin());

-- Only admin can delete
create policy site_settings_delete
  on public.site_settings for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- SEED DEFAULT SETTINGS
-- ============================================================

-- 1. Section visibility (homepage section toggles)
insert into public.site_settings (key, value) values
('section_visibility', '{
  "hero": true,
  "stats_bar": true,
  "latest_insights": true,
  "featured_case_study": true,
  "career_timeline": true,
  "testimonials": true,
  "newsletter_cta": true,
  "services_preview": true,
  "media_appearances": true,
  "personal_intro": true,
  "photo_gallery": true,
  "hobbies": true,
  "personal_projects": true,
  "what_i_do": true,
  "now_section": true,
  "finance_ticker": false,
  "calculators": false,
  "market_insights": false
}'::jsonb);

-- 2. Page visibility (controls navbar + routing)
insert into public.site_settings (key, value) values
('page_visibility', '{
  "about": true,
  "services": true,
  "portfolio": true,
  "blog": true,
  "contact": true,
  "resources": false,
  "tools": false,
  "market_insights": false
}'::jsonb);

-- 3. Site identity
insert into public.site_settings (key, value) values
('site_identity', '{
  "site_name": "Your Name",
  "tagline": "Finance Professional & Advisor",
  "logo_url": null,
  "favicon_url": null,
  "og_image_url": null,
  "site_mode": "hybrid",
  "footer_text": "© 2026 Your Name. All rights reserved."
}'::jsonb);

-- 4. SEO defaults
insert into public.site_settings (key, value) values
('seo_defaults', '{
  "title_template": "%s | Your Name",
  "default_description": "Personal profile and finance insights",
  "google_analytics_id": "",
  "posthog_key": ""
}'::jsonb);

-- 5. Hero content
insert into public.site_settings (key, value) values
('hero_content', '{
  "heading": "Your Name",
  "subheading": "Finance Professional & Advisor",
  "description": "Helping businesses and investors make smarter financial decisions.",
  "cta_primary_text": "View Insights",
  "cta_primary_link": "/blog",
  "cta_secondary_text": "Book a Consultation",
  "cta_secondary_link": "/contact",
  "show_cta_tertiary": true,
  "cta_tertiary_text": "Download CV",
  "background_style": "grid"
}'::jsonb);

-- 6. Stats bar (KPI cards)
insert into public.site_settings (key, value) values
('stats_bar', '{
  "stats": [
    { "label": "Years Experience", "value": 12, "suffix": "+", "prefix": "", "icon": "clock" },
    { "label": "Assets Managed", "value": 50, "suffix": "M+", "prefix": "$", "icon": "trending-up" },
    { "label": "Clients", "value": 200, "suffix": "+", "prefix": "", "icon": "users" },
    { "label": "Articles", "value": 85, "suffix": "", "prefix": "", "icon": "file-text" },
    { "label": "Avg ROI", "value": 18, "suffix": "%", "prefix": "", "icon": "bar-chart" }
  ]
}'::jsonb);

-- 7. Social links
insert into public.site_settings (key, value) values
('social_links', '{
  "linkedin": "",
  "twitter": "",
  "youtube": "",
  "medium": "",
  "github": "",
  "instagram": "",
  "tiktok": "",
  "facebook": ""
}'::jsonb);

-- 8. "Now" section (what I'm doing now)
insert into public.site_settings (key, value) values
('now_section', '{
  "last_updated": "2026-04-04",
  "items": [
    { "emoji": "📈", "text": "Building investment strategies for Q2 2026" },
    { "emoji": "✍️", "text": "Writing a series on macro-economic trends" },
    { "emoji": "🎙️", "text": "Guest appearances on finance podcasts" },
    { "emoji": "📚", "text": "Reading: The Psychology of Money by Morgan Housel" }
  ]
}'::jsonb);
