-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('avatars',           'avatars',           true),
  ('blog-images',       'blog-images',       true),
  ('documents',         'documents',         true),
  ('case-study-assets', 'case-study-assets', true);

-- ============================================================
-- STORAGE RLS POLICIES
-- Public can read all buckets; only authenticated admin can write.
-- ============================================================

-- Helper array for looping
do $$
declare
  bucket text;
begin
  foreach bucket in array array[
    'avatars', 'blog-images', 'documents', 'case-study-assets'
  ] loop
    -- Anyone can read (download / list)
    execute format(
      'create policy %I on storage.objects for select to anon, authenticated using (bucket_id = %L)',
      bucket || '_select', bucket
    );

    -- Admin can upload
    execute format(
      'create policy %I on storage.objects for insert to authenticated with check (bucket_id = %L and public.is_admin())',
      bucket || '_insert', bucket
    );

    -- Admin can update (overwrite)
    execute format(
      'create policy %I on storage.objects for update to authenticated using (bucket_id = %L and public.is_admin())',
      bucket || '_update', bucket
    );

    -- Admin can delete
    execute format(
      'create policy %I on storage.objects for delete to authenticated using (bucket_id = %L and public.is_admin())',
      bucket || '_delete', bucket
    );
  end loop;
end;
$$;
