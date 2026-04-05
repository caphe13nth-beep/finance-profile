-- ============================================================
-- Add locale + translation linking to blog_posts
-- ============================================================

-- 1. Add locale column (defaults to 'en' for all existing rows)
alter table public.blog_posts
  add column if not exists locale text not null default 'en';

-- 2. Add self-referencing FK for translation linking
--    translation_of points to the "original" post this is a translation of.
--    When the original is deleted, translations become standalone (SET NULL).
alter table public.blog_posts
  add column if not exists translation_of uuid
    references public.blog_posts(id) on delete set null;

-- 3. Index for fast locale filtering
create index if not exists idx_blog_posts_locale
  on public.blog_posts(locale);

-- 4. Index for looking up translations of a given post
create index if not exists idx_blog_posts_translation_of
  on public.blog_posts(translation_of)
  where translation_of is not null;

-- 5. Unique constraint: only one translation per locale per original post
create unique index if not exists idx_blog_posts_unique_translation
  on public.blog_posts(translation_of, locale)
  where translation_of is not null;
