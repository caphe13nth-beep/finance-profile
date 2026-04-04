-- ============================================================
-- RESOURCES (downloadable documents)
-- ============================================================
create table public.resources (
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

-- Updated_at trigger
create trigger set_updated_at before update on public.resources
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.resources enable row level security;

create policy resources_select
  on public.resources for select to anon, authenticated using (true);

create policy resources_insert
  on public.resources for insert to authenticated with check (public.is_admin());

create policy resources_update
  on public.resources for update to authenticated using (public.is_admin());

create policy resources_delete
  on public.resources for delete to authenticated using (public.is_admin());
