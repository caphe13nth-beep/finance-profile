-- ============================================================
-- Migrate blog_posts from is_published boolean to status enum
-- Add scheduled_at column for scheduled publishing
-- ============================================================

-- 1. Add new columns
alter table public.blog_posts
  add column if not exists status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'published', 'archived')),
  add column if not exists scheduled_at timestamptz;

-- 2. Migrate existing data
update public.blog_posts
  set status = case
    when is_published = true then 'published'
    else 'draft'
  end;

-- 3. Drop old column
alter table public.blog_posts drop column if exists is_published;
