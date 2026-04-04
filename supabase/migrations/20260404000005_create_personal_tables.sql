-- ============================================================
-- 1. PERSONAL PROJECTS
-- ============================================================
create table public.personal_projects (
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

alter table public.personal_projects enable row level security;

create policy personal_projects_select
  on public.personal_projects for select to anon, authenticated using (true);

create policy personal_projects_insert
  on public.personal_projects for insert to authenticated with check (public.is_admin());

create policy personal_projects_update
  on public.personal_projects for update to authenticated using (public.is_admin());

create policy personal_projects_delete
  on public.personal_projects for delete to authenticated using (public.is_admin());

-- ============================================================
-- 2. PHOTO GALLERY
-- ============================================================
create table public.photo_gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  category text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.photo_gallery enable row level security;

create policy photo_gallery_select
  on public.photo_gallery for select to anon, authenticated using (true);

create policy photo_gallery_insert
  on public.photo_gallery for insert to authenticated with check (public.is_admin());

create policy photo_gallery_update
  on public.photo_gallery for update to authenticated using (public.is_admin());

create policy photo_gallery_delete
  on public.photo_gallery for delete to authenticated using (public.is_admin());

-- ============================================================
-- 3. HOBBIES & INTERESTS
-- ============================================================
create table public.hobbies_interests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  image_url text,
  sort_order integer not null default 0
);

alter table public.hobbies_interests enable row level security;

create policy hobbies_interests_select
  on public.hobbies_interests for select to anon, authenticated using (true);

create policy hobbies_interests_insert
  on public.hobbies_interests for insert to authenticated with check (public.is_admin());

create policy hobbies_interests_update
  on public.hobbies_interests for update to authenticated using (public.is_admin());

create policy hobbies_interests_delete
  on public.hobbies_interests for delete to authenticated using (public.is_admin());
