# Upgrade Build Plan — Claude Code Prompts Only

Read CLAUDE.md files before every prompt below.

---

## Upgrade A — Admin Site Configurator

### A.1 — Site Settings Table

> Read all CLAUDE.md files in the project. Create a Supabase SQL migration file that creates a `site_settings` table with columns: id (UUID), key (TEXT UNIQUE), value (JSONB), updated_at (TIMESTAMPTZ). Insert default rows for: `section_visibility` (toggles for hero, stats_bar, latest_insights, featured_case_study, career_timeline, testimonials, newsletter_cta, services_preview, finance_ticker, market_insights, media_appearances, personal_intro, photo_gallery, hobbies, personal_projects, what_i_do, now_section — all true except finance_ticker, calculators, market_insights which default false), `page_visibility` (about, services, portfolio, blog, resources, contact, tools, market_insights — all true except resources, tools, market_insights), `site_identity` (site_name, tagline, logo_url, favicon_url, og_image_url, site_mode as "hybrid", footer_text), `seo_defaults` (title_template, default_description, google_analytics_id, posthog_key), `hero_content` (heading, subheading, description, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link, show_cta_tertiary, cta_tertiary_text, background_style), `stats_bar` (array of 5 stats each with label, value, suffix, prefix, icon), `social_links` (linkedin, twitter, youtube, medium, github, instagram, tiktok, facebook), `now_section` (last_updated, items array with emoji and text). Add public SELECT RLS policy and admin-only UPDATE policy. Print the SQL so I can run it in Supabase SQL Editor.

### A.2 — Settings Provider

> Read all CLAUDE.md files. Create a SettingsProvider React context at lib/settings-provider.tsx. It should accept all site_settings data as props and provide them via context. Create a useSettings hook. Create a server-side helper function fetchAllSettings in lib/supabase/ that fetches all rows from site_settings and returns them as a typed object. Update the root layout to fetch settings server-side and wrap the app in SettingsProvider. Add TypeScript types for all settings shapes in the types directory.

### A.3 — Conditional Rendering

> Read all CLAUDE.md files. Update the homepage to use the SettingsProvider. Every homepage section should be wrapped in a conditional check against section_visibility from settings context. If a section's key is false, don't render it. Update the Navbar to read page_visibility and only show links for enabled pages. Update the hero section to read its content (heading, subheading, description, CTA buttons) from hero_content setting instead of hardcoded values. Update the stats bar to read its stats from the stats_bar setting. Update the footer to read social links from social_links setting and site identity from site_identity. For every page that can be disabled via page_visibility, add a check at the top — if the page is disabled, call notFound().

### A.4 — Admin Settings: Sections & Pages

> Read all CLAUDE.md files. Build an admin settings page at /admin/settings/sections. Show a list of all homepage sections with a shadcn Switch toggle for each. Toggling calls a server action that updates the section_visibility key in site_settings and calls revalidateTag('settings'). Build another page at /admin/settings/pages with toggles for each page. Same pattern — update page_visibility and revalidate. Add these routes to the admin sidebar navigation.

### A.5 — Admin Settings: General & Hero & Stats

> Read all CLAUDE.md files. Build /admin/settings/general — form to edit site_identity fields (site_name, tagline, site_mode dropdown with personal/finance/hybrid, footer_text, logo upload to Supabase Storage). Build /admin/settings/hero — form to edit all hero_content fields (heading, subheading, description, CTA texts and links, background_style dropdown). Build /admin/settings/stats — editable list of stat cards, each with label, value, prefix, suffix, icon dropdown from Lucide icons. Allow add, remove, and reorder. All save to site_settings via server actions and call revalidateTag('settings').

### A.6 — Admin Settings: Social & SEO

> Read all CLAUDE.md files. Build /admin/settings/social — form with input fields for each social platform URL from social_links setting. Build /admin/settings/seo — form for title_template, default_description, google_analytics_id, posthog_key from seo_defaults. Both save to site_settings and revalidate.

---

## Upgrade B — Theme Engine

### B.1 — Theme Settings

> Read all CLAUDE.md files. Add a new row to site_settings SQL migration with key "theme" containing: preset (string), colors object (primary, secondary, background, accent, accent_secondary, card_bg, text_primary, text_secondary, border), dark_colors object (same keys), fonts object (heading, body, mono), border_radius, enable_dark_mode_toggle, default_dark. Print the SQL INSERT statement. Then update the root layout to read the theme setting and inject all colors as CSS variables on the html element, with dark mode variants inside .dark class. Update tailwind.config to reference these CSS variables instead of hardcoded colors. Replace all hardcoded color classes across the project with the CSS variable versions.

### B.2 — Theme Presets & Admin Page

> Read all CLAUDE.md files. Build /admin/settings/theme. At the top show 5 preset cards (Corporate Finance: navy+gold+Space Grotesk, Modern Fintech: dark blue+cyan+Sora, Minimal Personal: clean white+coral+Playfair Display, Warm Creative: earthy+amber+DM Serif Display, Dark Luxe: black+gold+Cormorant Garamond). Clicking a preset fills in all the color and font fields below. Below presets, show color picker inputs for each color in the theme. Add font family dropdowns with 15 Google Fonts options for heading, body, and mono. Add border radius slider. Add toggles for enable_dark_mode_toggle and default_dark. Add a live preview panel that shows a mini card with the current colors and fonts updating in real time. Save button updates site_settings theme key and calls revalidateTag('settings'). Load the selected Google Fonts dynamically in the root layout based on the theme fonts setting.

---

## Upgrade C — Personal Introduction Mode

### C.1 — New Tables

> Read all CLAUDE.md files. Create SQL migrations for three new tables: personal_projects (id UUID, title, description, category, image_url, link, tags text[], is_featured boolean, sort_order int, created_at), photo_gallery (id UUID, image_url, caption, category, sort_order int, created_at), hobbies_interests (id UUID, title, description, icon, image_url, sort_order int). Add public SELECT RLS and admin full CRUD RLS on all three. Print the SQL.

### C.2 — Personal Homepage Sections

> Read all CLAUDE.md files. Build these new homepage section components, all conditionally rendered based on section_visibility: 1) PersonalIntro — a warm story-driven bio block with large photo, casual description, reads from profile data. 2) NowSection — reads now_section from site_settings, shows emoji + text items in a card with "last updated" date. 3) PhotoGallery — masonry grid of images from photo_gallery table with lightbox on click, category filter tabs. 4) HobbiesSection — icon cards grid from hobbies_interests table showing title, description, icon/image. 5) PersonalProjects — card grid from personal_projects table with title, description, image, tags, link. Add all these to the homepage with conditional checks. They should appear when the respective section_visibility key is true.

### C.3 — Adaptive About Page

> Read all CLAUDE.md files. Update the About page to adapt based on site_identity.site_mode from settings. In "personal" mode: show a long-form story bio, photo gallery section, hobbies section, personal values, and fun facts. In "finance" mode: show career timeline, certifications, skills grid, download CV. In "hybrid" mode: show personal story at top, then professional details below. Fetch the site_mode from settings context and conditionally render sections accordingly.

### C.4 — Admin CRUD for Personal Content

> Read all CLAUDE.md files. Build admin CRUD pages following the existing admin CRUD pattern: /admin/projects for personal_projects table (DataTable with title/category/featured columns, create/edit form with image upload, drag reorder), /admin/gallery for photo_gallery table (image grid view, upload multiple images, edit caption/category, drag reorder), /admin/hobbies for hobbies_interests table (list with icon preview, create/edit form, drag reorder). Build /admin/settings/now — editor for now_section setting (editable list of emoji+text items, add/remove/reorder, last_updated date). Add all routes to admin sidebar. All mutations call revalidateTag('content').

---

## Upgrade D — Advanced Admin Dashboard

### D.1 — Analytics Dashboard

> Read all CLAUDE.md files. Upgrade /admin/dashboard. Show 6 stat cards at top: total blog posts, total published posts, total subscribers, total unread contacts, total projects, total case studies — all fetched from Supabase with count queries. Below add a Recharts line chart showing new subscribers per day over the last 30 days. Add a bar chart for top 5 blog posts by view_count. Add a recent activity feed showing the last 10 items across contact_submissions and newsletter_subscribers ordered by created_at. Use shadcn Card components and the project's chart styling.

### D.2 — Content Scheduling

> Read all CLAUDE.md files. Add a scheduled_at (TIMESTAMPTZ nullable) column and change blog_posts to use a status column (draft/scheduled/published/archived) instead of is_published boolean. Print the ALTER TABLE SQL. Update the admin posts CRUD to show a status dropdown and a date picker for scheduled_at. Update the blog listing query to filter by status='published' AND (published_at <= now()). Update all references to is_published across the codebase to use the new status field.

### D.3 — Drag-and-Drop Reordering

> Read all CLAUDE.md files. Install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities. Create a reusable SortableList component that wraps any admin list with drag-and-drop reordering. It should update sort_order in the database via a server action on drop. Apply it to the admin pages for: services, testimonials, career_timeline, hobbies, photo_gallery, personal_projects.

### D.4 — Media Library

> Read all CLAUDE.md files. Build /admin/media-library page. List all files across all Supabase Storage buckets (avatars, blog-images, documents, case-study-assets) in a grid view. Show image thumbnails with filename, size, and bucket name. Add upload button that lets admin choose which bucket to upload to. Add copy URL button and delete button for each file. Add search by filename and filter by bucket. Add this to admin sidebar.

---

## Upgrade E — Engagement Features

### E.1 — Blog Views & Reactions

> Read all CLAUDE.md files. Add view_count (INT default 0) column to blog_posts — print the ALTER TABLE SQL. Create a blog_reactions table (id UUID, post_id UUID FK, reaction TEXT check in 'like','insightful','fire','bookmark', visitor_id TEXT, created_at, unique on post_id+reaction+visitor_id) — print the SQL with RLS allowing public insert/select. Build an API route POST /api/views that increments view_count for a given post_id. Build POST /api/reactions that toggles a reaction using a visitor_id from a cookie. Create a BlogReactions client component that shows 4 reaction buttons with counts at the bottom of each blog post. Call the views API on blog post page load. Show view count on blog listing cards.

### E.2 — Related Posts

> Read all CLAUDE.md files. Build a RelatedPosts component shown at the bottom of each blog post page. Query 3 posts that share the same category or overlapping tags with the current post, excluding the current post, ordered by published_at desc. Show as horizontal card row with image, title, category, reading time.

### E.3 — Comments (Giscus)

> Read all CLAUDE.md files. Add Giscus comments to the bottom of each blog post page. Create a GiscusComments client component that loads the Giscus script with data attributes. Add admin settings fields in /admin/settings/general for giscus_repo, giscus_repo_id, giscus_category, giscus_category_id. Read these from settings context. Only render if the values are filled in. Add a section_visibility toggle for "comments".

### E.4 — Newsletter Broadcasting

> Read all CLAUDE.md files. Create a newsletter_campaigns table (id UUID, subject, body text, sent_at timestamptz, recipient_count int, status text default 'draft') — print the SQL. Build /admin/newsletter page with: a compose form (subject input, rich text body using the existing editor), preview button that shows the email in a modal, send button that calls a server action which fetches all active subscribers from newsletter_subscribers and sends the email to each via Resend API in batches, updates the campaign status to 'sent' with recipient_count and sent_at. Show a list of past campaigns below the compose form.

---

## Upgrade F — Polish & Micro-Interactions

### F.1 — Dynamic OG Images

> Read all CLAUDE.md files. Install @vercel/og. Create an API route at /api/og/route.tsx that generates a dynamic Open Graph image. Accept query params: title, subtitle, type (blog/page/default). Render a branded 1200x630 image using the site's theme colors and heading font. Show the title large, subtitle below, site name in corner. Update generateMetadata for blog posts to use this route for og:image with the post title as a param.

### F.2 — Command Palette

> Read all CLAUDE.md files. Install cmdk. Build a global CommandPalette component triggered by Cmd+K / Ctrl+K. Include: search blog posts (fetch from Supabase on type), navigate to all site pages, toggle dark mode, link to admin (if authenticated). Style it with the project's theme. Add it to the root layout.

### F.3 — Page Transitions & Scroll Animations

> Read all CLAUDE.md files. Add Framer Motion AnimatePresence page transitions in the root layout — fade and slight slide up on page change. Audit all homepage sections and content pages: add scroll-triggered Framer Motion animations (fade-in-up for sections, stagger for card grids, scale-up for stats). Add a floating "back to top" button that appears after scrolling 500px, smooth scrolls to top on click. Add a reading progress bar on blog post pages that fills as the user scrolls.

### F.4 — Blog TOC Improvements

> Read all CLAUDE.md files. Upgrade the table of contents on blog post pages. Auto-generate from all h2 and h3 headings in the post body. Highlight the current section based on scroll position using IntersectionObserver. Make it collapsible on mobile with a floating TOC button. Smooth scroll to heading on click.

---

## Upgrade G — Performance & Infrastructure

### G.1 — Rate Limiting

> Read all CLAUDE.md files. Install @upstash/ratelimit and @upstash/redis. Create a rate limiter utility in lib/rate-limit.ts. Apply rate limiting to: POST /api/contact (5 per hour per IP), POST /api/newsletter (3 per hour per IP), POST /api/reactions (30 per hour per IP), POST /api/views (60 per hour per IP). Return 429 status with a friendly message when rate limited. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to env example.

### G.2 — Database Indexes

> Read all CLAUDE.md files. Create a SQL migration file with performance indexes: blog_posts on published_at DESC where status='published', blog_posts on slug, blog_posts on category, case_studies on industry, contact_submissions on created_at DESC where is_read=false, newsletter_subscribers on email, site_settings on key, personal_projects on sort_order, photo_gallery on category. Print the SQL.

### G.3 — Image Optimization

> Read all CLAUDE.md files. Create a custom Next.js image loader for Supabase Storage URLs in lib/supabase/image-loader.ts. Configure next.config to use Supabase Storage domain in remotePatterns. Audit all image usage across the project — ensure every image uses next/image with proper width, height, and priority for above-fold images. Add blur placeholders for blog post featured images using plaiceholder if sharp is available, otherwise use a CSS shimmer placeholder.

### G.4 — Error Monitoring

> Read all CLAUDE.md files. Install @sentry/nextjs. Run the Sentry wizard setup or manually configure sentry.client.config.ts, sentry.server.config.ts, and sentry.edge.config.ts. Add SENTRY_DSN to env. Wrap the root error.tsx and global-error.tsx to report to Sentry. Add Sentry to next.config via withSentryConfig.

### G.5 — Caching Strategy

> Read all CLAUDE.md files. Audit all data fetching across the project and apply this caching strategy: site_settings fetches use revalidateTag('settings') with a 1 hour revalidate. Blog posts, case studies, services, testimonials use revalidateTag('content') with 30 min revalidate. Admin pages use no-store. All admin server actions that modify content call revalidateTag('content'). All settings server actions call revalidateTag('settings'). Update the /api/revalidate route to accept both path and tag parameters.

---

## Upgrade H — Multilingual (Optional)

### H.1 — i18n Setup

> Read all CLAUDE.md files. Install next-intl. Set up the middleware and routing for two locales: en (default) and vi (Vietnamese). Move all public pages under a [locale] route group. Create messages/en.json and messages/vi.json with all static UI strings (navbar labels, button texts, footer text, form labels, section headings). Update all components to use useTranslations from next-intl instead of hardcoded strings. Add a language switcher dropdown in the Navbar that changes locale and preserves the current path.

### H.2 — Content Translation

> Read all CLAUDE.md files. Add locale (TEXT default 'en') and translation_of (UUID nullable FK to self) columns to blog_posts. Print the ALTER TABLE SQL. Update the blog listing page to filter by current locale. Update the blog post page to show a language switcher linking to the translated version if translation_of is set. Update the admin posts CRUD to show a locale dropdown and a "translate from" selector that copies content from an existing post into a new one with a different locale.

---

## Final — Update CLAUDE.md Files

> Read all CLAUDE.md files in the project. Update the root CLAUDE.md to include: the site_settings system and SettingsProvider pattern, all new tables (site_settings, personal_projects, photo_gallery, hobbies_interests, blog_reactions, newsletter_campaigns), the site mode system (personal/finance/hybrid), the theme CSS variable injection pattern, the caching strategy with revalidateTag, rate limiting on API routes, all new dependencies added during the upgrade. Update the app-level CLAUDE.md to include: all new admin routes, the conditional rendering rules for section_visibility and page_visibility, the adaptive about page logic, all API routes including /api/og /api/views /api/reactions, the content scheduling status field replacing is_published. Make sure all file paths match the actual project structure.
