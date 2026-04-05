-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================

-- Blog posts: published listing (most common query)
create index if not exists idx_blog_posts_published
  on public.blog_posts (published_at desc)
  where status = 'published';

-- Blog posts: slug lookup
create unique index if not exists idx_blog_posts_slug
  on public.blog_posts (slug);

-- Blog posts: category filter
create index if not exists idx_blog_posts_category
  on public.blog_posts (category)
  where status = 'published';

-- Case studies: industry filter
create index if not exists idx_case_studies_industry
  on public.case_studies (industry);

-- Contact submissions: unread inbox
create index if not exists idx_contact_submissions_unread
  on public.contact_submissions (created_at desc)
  where is_read = false;

-- Newsletter subscribers: email lookup (unique already exists, this is explicit)
create index if not exists idx_newsletter_subscribers_email
  on public.newsletter_subscribers (email);

-- Site settings: key lookup
create unique index if not exists idx_site_settings_key
  on public.site_settings (key);

-- Personal projects: sort order
create index if not exists idx_personal_projects_sort
  on public.personal_projects (sort_order);

-- Photo gallery: category filter
create index if not exists idx_photo_gallery_category
  on public.photo_gallery (category);
