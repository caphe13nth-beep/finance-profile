-- ============================================================
-- 1. Add view_count to blog_posts
-- ============================================================
alter table public.blog_posts
  add column if not exists view_count integer not null default 0;

-- ============================================================
-- 2. Blog Reactions table
-- ============================================================
create table public.blog_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  reaction text not null check (reaction in ('like', 'insightful', 'fire', 'bookmark')),
  visitor_id text not null,
  created_at timestamptz not null default now(),
  unique (post_id, reaction, visitor_id)
);

-- RLS: public can read and insert, admin can do everything
alter table public.blog_reactions enable row level security;

create policy blog_reactions_select
  on public.blog_reactions for select
  to anon, authenticated
  using (true);

create policy blog_reactions_insert
  on public.blog_reactions for insert
  to anon, authenticated
  with check (true);

create policy blog_reactions_delete
  on public.blog_reactions for delete
  to anon, authenticated
  using (true);

-- Index for fast lookups
create index blog_reactions_post_id_idx on public.blog_reactions(post_id);
