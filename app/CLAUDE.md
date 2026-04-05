# App Router Rules

## Directory Structure
- `app/layout.tsx` — root layout (html, body, fonts, globals.css)
- `app/[locale]/layout.tsx` — locale layout with providers,
  Header, Footer, theme injection, settings fetch
- `app/[locale]/` — all public-facing pages
- `app/admin/` — protected CMS pages with admin layout + sidebar,
  requires Supabase Auth session
- `app/api/` — API route handlers
- `app/actions/` — server actions for mutations

## Internationalization
- All public pages live under `app/[locale]/` with locale param
- Every server page must call `setRequestLocale(locale)` at top
- Use `getTranslations('Namespace')` in server components
- Use `useTranslations('Namespace')` in client components
- Use `Link` from `@/i18n/navigation` (not `next/link`) for
  locale-aware links in public pages
- Translation files: `messages/en.json`, `messages/vi.json`
- `proxy.ts` routes: admin paths bypass i18n, API/static skip it,
  all other paths go through next-intl middleware

## Site Settings System
- Locale layout fetches all `site_settings` from Supabase and
  wraps app in `<SettingsProvider>`
- Navbar reads `page_visibility` to decide which links to render
- Homepage reads `section_visibility` to conditionally render
  sections via `<ConditionalSection sectionKey="...">` wrapper
- Theme colors/fonts read from `theme` setting and injected as
  CSS variables in `<html>` tag via `safeThemeStyle()` and
  `safeFontStyle()` in locale layout
- Always use settings context (`useSettings()`), never hardcode
  section visibility or theme values

## Conditional Rendering Rules
- Never render a section without checking `section_visibility`
- Never show a nav link without checking `page_visibility`
- If a page is disabled in `page_visibility`, its `page.tsx`
  must call `notFound()`
- Stats bar reads `stats_bar` setting for content, not hardcoded
- Hero reads `hero_content` setting for all text and CTAs
- Section keys: hero, stats_bar, latest_insights,
  featured_case_study, career_timeline, testimonials,
  newsletter_cta, services_preview, media_appearances,
  personal_intro, photo_gallery, hobbies, personal_projects,
  what_i_do, now_section, comments, finance_ticker, calculators,
  market_insights
- Page keys: about, services, portfolio, blog, contact,
  resources, tools, market_insights

## Page Patterns
- Every page.tsx exports `generateMetadata` using `seo_defaults`
  from site_settings
- Blog posts use `generateStaticParams` + `revalidate` for ISR
- Admin pages check auth at layout level, redirect to
  `/admin/login` if no session
- Pages hidden via `page_visibility` return `notFound()`
  if accessed directly by URL

## About Page Adaptive Layout
- `components/about/about-layout.tsx` receives `mode` prop from
  `site_identity.site_mode`
- **personal**: PersonalStory, PersonalValues, PhotoGallery,
  Hobbies, FunFacts
- **finance**: ProfessionalBio (with CV download), Skills grid,
  Career Timeline, Certifications
- **hybrid**: PersonalStory, PersonalValues, Skills, Timeline,
  Certifications, PhotoGallery, Hobbies

## Blog Post Content Model
- `status` field replaces the old `is_published` boolean
- Status values: `draft`, `scheduled`, `published`, `archived`
- `scheduled_at` (timestamptz) for future publishing
- `published_at` set automatically when status changes to
  `published`
- `locale` (text, default `'en'`) — content language
- `translation_of` (uuid, self-FK) — links to original post
  for translations; unique per (translation_of, locale)
- Blog listing filters by current locale
  (`getPublishedPostsByLocale`)
- Blog post page shows `<TranslationSwitcher>` linking to
  translated versions when available
- Admin posts page has locale dropdown, "Translation of"
  selector, and "Translate" action that copies content into
  a new post with a different locale

## Data Fetching
- Public pages: server components, cached via `unstable_cache`
  with tag `"content"` (30 min) and tag `"settings"` (1 hr)
- Admin pages: no-cache, client-side fetch via `createClient()`
- Cached queries use `createAdminClient()` (service role key,
  no cookies — required for `unstable_cache` compatibility)
- Browser client (`lib/supabase/client.ts`) only in
  `"use client"` components

## API Routes

### Public
- **POST /api/contact** — Zod validate, insert
  `contact_submissions`, send email via Resend.
  Rate limited: 5/hr per IP
- **POST /api/newsletter** — validate email, insert
  `newsletter_subscribers`. Rate limited: 3/hr per IP
- **POST /api/reactions** — insert/toggle `blog_reactions`
  using `visitor_id` httpOnly cookie. Toggle logic: delete if
  exists, insert if not. Returns counts + active reactions.
  Rate limited: 30/hr per IP
- **GET /api/reactions?post_id=** — fetch reaction counts and
  active reactions for current visitor
- **POST /api/views** — increment `blog_posts.view_count` via
  RPC or fallback UPDATE. Rate limited: 60/hr per IP
- **GET /api/og** — dynamic OG image generation via `@vercel/og`

### Protected
- **POST /api/revalidate** — requires `x-revalidate-token`
  header matching `REVALIDATE_SECRET` env var. Accepts
  `{ paths?: string[], tags?: string[], all?: boolean }`.
  Calls `revalidatePath()` / `revalidateTag()` accordingly.

### Debug (development)
- **GET /api/debug** — env var check, Supabase connectivity
- **GET /api/debug-data** — table row counts and schema info

## Admin Routes

### Settings (all update `site_settings` table)
- `/admin/settings` — settings overview / hub
- `/admin/settings/general` — site name, mode, logo, identity
- `/admin/settings/sections` — toggle homepage sections
- `/admin/settings/pages` — toggle site pages (updates navbar)
- `/admin/settings/hero` — hero heading, CTAs, background style
- `/admin/settings/stats` — KPI cards (label, value, icon)
- `/admin/settings/now` — "What I'm doing now" items
- `/admin/settings/social` — social media URLs
- `/admin/settings/theme` — preset selector, color pickers,
  font dropdowns, live preview
- `/admin/settings/seo` — title template, description,
  analytics IDs

### Content CRUD
- `/admin/profile` — single profile record
- `/admin/posts` — blog CRUD + scheduling + status + locale +
  translate-from (copies content to new locale)
- `/admin/case-studies` — case studies CRUD
- `/admin/services` — services CRUD + drag reorder
- `/admin/testimonials` — testimonials CRUD + drag reorder
- `/admin/insights` — market insights CRUD
- `/admin/media` — media appearances CRUD
- `/admin/timeline` — career timeline CRUD + drag reorder
- `/admin/projects` — personal projects CRUD
- `/admin/gallery` — photo gallery CRUD
- `/admin/hobbies` — hobbies & interests CRUD
- `/admin/resources` — downloadable resources CRUD + drag reorder

### Management
- `/admin` — dashboard with analytics, charts, recent activity
- `/admin/contacts` — inbox, mark read, bulk actions
- `/admin/subscribers` — list, export CSV
- `/admin/newsletter` — compose + send broadcasts
- `/admin/media-library` — browse all storage buckets

## Admin CRUD Pattern
1. List page with DataTable (sortable, searchable, bulk actions)
2. Create/Edit form in sheet or modal with React Hook Form + Zod
3. Server actions for insert/update/delete
   (`app/actions/admin-crud.ts`)
4. Drag reorder via @dnd-kit where `sort_order` exists
5. Image uploads go to Supabase Storage via shared
   `<ImageUpload>` component
6. After any content mutation: `revalidateTag("content")`
7. After settings mutation: `revalidateTag("settings")`

## Site Modes
- `site_identity.site_mode` controls overall tone:
  - `"personal"` — warm intro, photo gallery, hobbies, projects,
    hides finance jargon
  - `"finance"` — KPIs, market insights, calculators, case
    studies, skills, certifications
  - `"hybrid"` — everything available, admin toggles individual
    sections
- About page adapts layout based on mode
- Components should check mode when choosing copy/labels
