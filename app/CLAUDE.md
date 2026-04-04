# App Router Rules

## Route Groups
- (site)/ — all public-facing pages, uses main layout with Navbar + Footer
- admin/ — protected CMS pages, uses admin layout with sidebar,
  requires Supabase Auth session + admins table check

## Site Settings System
- Root layout fetches all site_settings from Supabase and wraps
  app in <SettingsProvider>
- Navbar reads page_visibility to decide which links to render
- Homepage reads section_visibility to conditionally render sections
- Theme colors/fonts read from theme setting and injected as
  CSS variables in <html> tag
- Always use settings context, never hardcode section visibility
  or theme values

## Page Patterns
- Every page.tsx exports generateMetadata using seo_defaults
  from site_settings
- Blog posts use generateStaticParams + revalidate for ISR
- Admin pages check auth at layout level, redirect to
  /admin/login if no session
- Pages hidden via page_visibility should return notFound()
  if accessed directly by URL

## Data Fetching
- Public pages: server components with revalidateTag('settings')
  and revalidateTag('content')
- Admin pages: no-cache, always fresh
- Use server client (lib/supabase/server.ts) in server components
- Use browser client only in "use client" components
- Site settings: cache with tag 'settings', revalidate on
  admin save

## API Routes (src/app/api/)
- POST /api/contact — Zod validate, insert contact_submissions,
  send email via Resend, rate limited (5/hr per IP)
- POST /api/newsletter — validate email, insert
  newsletter_subscribers, rate limited (3/hr per IP)
- POST /api/revalidate — secret token, revalidatePath or
  revalidateTag
- POST /api/reactions — insert/toggle blog_reactions using
  visitor_id cookie
- GET  /api/og — dynamic OG image generation via @vercel/og

## Admin Routes

### Settings (all update site_settings table)
- /admin/settings/general — site name, mode, logo, identity
- /admin/settings/sections — toggle homepage sections
- /admin/settings/pages — toggle site pages (updates navbar)
- /admin/settings/hero — hero heading, CTAs, background style
- /admin/settings/stats — KPI cards (label, value, icon)
- /admin/settings/now — "What I'm doing now" items
- /admin/settings/social — social media URLs
- /admin/settings/theme — preset selector, color pickers,
  font dropdowns, live preview
- /admin/settings/seo — title template, description, analytics IDs

### Content CRUD
- /admin/profile — single profile record
- /admin/posts — blog CRUD + scheduling + status
- /admin/case-studies — case studies CRUD
- /admin/services — services CRUD + drag reorder
- /admin/testimonials — testimonials CRUD + drag reorder
- /admin/insights — market insights CRUD
- /admin/media — media appearances CRUD
- /admin/timeline — career timeline CRUD + drag reorder
- /admin/projects — personal projects CRUD
- /admin/gallery — photo gallery CRUD
- /admin/hobbies — hobbies & interests CRUD

### Management
- /admin/dashboard — analytics, charts, recent activity
- /admin/contacts — inbox, mark read, bulk actions
- /admin/subscribers — list, export CSV
- /admin/newsletter — compose + send broadcasts
- /admin/media-library — browse all storage buckets

## Admin CRUD Pattern
1. List page with DataTable (sortable, searchable, bulk actions)
2. Create/Edit form in sheet or modal with React Hook Form + Zod
3. Server actions for insert/update/delete
4. Drag reorder via @dnd-kit where sort_order exists
5. Image uploads go to Supabase Storage via shared component
6. After any mutation: revalidateTag('content')
7. After settings mutation: revalidateTag('settings')

## Site Modes
- site_identity.site_mode controls overall tone:
  - "personal" — warm intro, photo gallery, hobbies, projects,
    hide finance jargon
  - "finance" — KPIs, market insights, calculators, case studies
  - "hybrid" — everything available, admin toggles individual
    sections
- About page adapts layout based on mode
- Components should check mode when choosing copy/labels

## Conditional Rendering Rules
- Never render a section without checking section_visibility
- Never show a nav link without checking page_visibility
- If a page is disabled in page_visibility, its page.tsx
  should call notFound()
- Stats bar reads stats_bar setting for content, not hardcoded
- Hero reads hero_content setting for all text and CTAs