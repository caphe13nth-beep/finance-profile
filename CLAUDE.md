## Site Settings System
- All site configuration stored in `site_settings` table as JSONB
  key-value rows: section_visibility, page_visibility, site_identity,
  seo_defaults, hero_content, stats_bar, social_links, now_section, theme
- Fetched at locale layout level via `fetchAllSettings()` in
  `lib/supabase/settings.ts`, cached with `unstable_cache` (tag
  `"settings"`, revalidate 3600s)
- Passed down via `<SettingsProvider>` context
  (`lib/settings-provider.tsx` exports `useSettings()` hook)
- Falls back to hardcoded DEFAULTS if Supabase is unreachable
- Every homepage section checks section_visibility before rendering
- Navbar/Footer read page_visibility to show/hide links
- After any settings change, call `revalidateTag("settings", { expire: 0 })`
- `site_identity` includes `avatar_url`, `cover_image_url`,
  `avatar_shape` (circle|squircle|hexagon), `cover_overlay`
  (none|gradient-mesh|gradient-linear|dark-vignette)

## Theme System
- Theme colors and fonts read from `site_settings.theme`
- `safeThemeStyle()` in `app/[locale]/layout.tsx` generates CSS
  variables injected via `<style dangerouslySetInnerHTML>`:
  - `:root` block: --background, --foreground, --primary,
    --secondary, --muted, --accent, --card, --popover, --border,
    --input, --ring, --chart-1..5, --radius, --destructive
  - `.dark` block: same variables from dark_colors
- `safeFontStyle()` generates Google Fonts `<link>` URL and
  CSS variables: --font-heading, --font-sans, --font-mono
- Theme init script in `<head>` reads localStorage to set
  dark/light class before paint (prevents flash)
- next-themes `<ThemeProvider>` handles toggle at runtime
- Theme toggle: pill-shaped sun/moon toggle with sliding knob,
  adds `.theme-transition` class to `<html>` for 500ms to
  smoothly transition all background/color/border properties
- CSS variables store hex values directly (e.g. `--accent: #10B981`)
  — use `var(--accent)` not `hsl(var(--accent))`; use
  `color-mix(in srgb, var(--accent) 35%, transparent)` for opacity

## Site Modes
- `site_identity.site_mode` controls overall tone:
  - `"personal"` — warm intro, photo gallery, hobbies, projects,
    hides finance jargon
  - `"finance"` — KPIs, market insights, calculators, case studies,
    skills, certifications
  - `"hybrid"` — everything available, admin toggles individual
    sections
- About page adapts layout based on mode
  (`components/about/about-layout.tsx`):
  - personal: PersonalStory → PersonalValues → PhotoGallery →
    Hobbies → FunFacts
  - finance: ProfessionalBio → Skills → Timeline → Certifications
  - hybrid: PersonalStory → PersonalValues → Skills → Timeline →
    Certifications → PhotoGallery → Hobbies

## Internationalization (i18n)
- Uses next-intl with two locales: `en` (default) and `vi` (Vietnamese)
- Config: `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`
- Messages: `messages/en.json`, `messages/vi.json`
- All public pages under `app/[locale]/`, admin and API at root
- `proxy.ts` handles both i18n routing and admin auth
- Server components: use `getTranslations` from `next-intl/server`
- Client components: use `useTranslations` from `next-intl`
- Links: use `Link` from `@/i18n/navigation` (not `next/link`)
  in public pages
- Language switcher in Navbar (`components/locale-switcher.tsx`)
- Blog posts have per-row `locale` column and `translation_of` FK
  for linked translations

## Database Tables
### Original tables
- **profiles** — single profile record (name, title, bio,
  photo_url, skills, certifications, resume_url, social_links)
- **blog_posts** — posts with status enum
  (`draft`|`scheduled`|`published`|`archived`), scheduled_at,
  view_count, locale (`en`|`vi`), translation_of (self-FK)
- **case_studies** — title, client, industry, challenge, strategy,
  result, kpi_metrics (JSONB)
- **services** — title, description, features, price, sort_order
- **testimonials** — name, company, quote, avatar_url, sort_order
- **market_insights** — asset analysis with thesis, risks,
  target_price, charts (JSONB)
- **media_appearances** — press/podcast/video with outlet, url, date
- **career_timeline** — year, title, organization, sort_order
- **newsletter_subscribers** — email (unique), is_active
- **contact_submissions** — name, email, subject, message, is_read
- **resources** — downloadable files with type
  (`whitepaper`|`template`|`guide`|`report`|`other`), sort_order

### Added in v2
- **site_settings** — key (text unique) + value (JSONB) config store
  - `site_identity` now includes: avatar_url, cover_image_url,
    avatar_shape, cover_overlay (added in design update)
- **personal_projects** — side projects with title, category,
  image_url, link, tags, is_featured, sort_order
- **photo_gallery** — personal photos with image_url, caption,
  category, sort_order
- **hobbies_interests** — title, description, icon, image_url,
  sort_order
- **blog_reactions** — post reactions (like, insightful, fire,
  bookmark) per visitor_id, unique per (post_id, reaction,
  visitor_id)
- **newsletter_campaigns** — email broadcasts with subject, body,
  status (`draft`|`sending`|`sent`|`failed`), sent_at,
  recipient_count

### Storage buckets (Supabase Storage, all public)
- avatars (profile/), blog-images (covers/), documents,
  case-study-assets

## Design System Components (v3)

### ProfileAvatar (`components/ui/profile-avatar.tsx`)
- Reusable avatar with animated gradient ring, multiple shapes
- Props: `src`, `fallback` (initials), `size` (sm/md/lg/xl),
  `shape` (circle|squircle|hexagon)
- Squircle default — 16-point superellipse CSS clip-path
- Animated conic-gradient ring using `@property` (globals.css)
- Exports: `ProfileAvatar` (full), `InlineProfileAvatar` (sm)
- Hover: scale + glow bloom via group-hover pattern

### Hero Cover Image (`components/home/hero.tsx`)
- Supports `site_identity.cover_image_url` as full-bleed bg
- Parallax at 0.5× scroll speed (disabled on mobile)
- Layered overlays controlled by `site_identity.cover_overlay`
- Frosted glass card wraps text when cover present
- Without cover: keeps original grid/dots/gradient patterns

### Floating Actions (`components/ui/floating-actions.tsx`)
- Unified bottom-right floating area (replaces BackToTop)
- Back-to-top button (accent bg, 44px touch target)
- Reading progress ring on blog posts (auto-detected via pathname)
- Appears after 400px scroll with framer-motion slide-up

### RevealOnScroll (`components/ui/reveal-on-scroll.tsx`)
- Reusable scroll-triggered animation wrapper
- Variants: fadeUp, fadeLeft, fadeRight, scaleIn
- `delay` prop for stagger, `will-change` auto-cleanup
- Most homepage sections have built-in reveal animations;
  use this for new sections or non-animated content

### Scroll Progress (`components/scroll-progress.tsx`)
- Global 2px accent bar at top of viewport
- GPU-accelerated via `transform: scaleX()`

### AvatarCoverUpload (`components/admin/avatar-cover-upload.tsx`)
- Admin drag-and-drop upload for avatar + cover images
- CSS-based crop modal (square for avatar, 16:9 for cover)
- Live `<ProfileAvatar>` preview for avatar

### globals.css custom classes
- `.avatar-ring`, `.avatar-shimmer` — ProfileAvatar animations
- `.timeline-dot-pulse` — timeline dot entrance pulse
- `.now-card` — sticky-note card (paper texture, rotation, hover)
- `.hobby-card`, `.hobby-icon` — pastel cards + wiggle animation
- `.cmd-dialog`, `.cmd-kbd` — command palette spotlight styling
- `.theme-transition` — temporary class for smooth theme switch
- `.scrollbar-none` — hides scrollbar for horizontal scroll areas

## Caching Strategy
- Two cache tags: `"content"` and `"settings"`
- Content queries (`lib/supabase/queries.ts`): all wrapped with
  `unstable_cache`, tag `["content"]`, revalidate 1800s (30 min)
- Settings query (`lib/supabase/settings.ts`): wrapped with
  `unstable_cache`, tag `["settings"]`, revalidate 3600s (1 hr)
- Admin content mutations (`app/actions/admin-crud.ts`): call
  `revalidateTag("content", { expire: 0 })` to clear immediately
- Settings mutations (`app/actions/settings.ts`): call
  `revalidateTag("settings", { expire: 0 })`
- All cached queries use `createAdminClient()` (service role,
  no cookies) since `cookies()` cannot be called inside
  `unstable_cache`
- `/api/revalidate` accepts `{ paths?, tags?, all? }` for
  manual revalidation (requires x-revalidate-token header)

## Rate Limiting
- Implementation: `lib/rate-limit.ts` using `@upstash/ratelimit`
  with `@upstash/redis` sliding window algorithm
- Graceful degradation: if Upstash env vars missing, allows all
- Limits per IP per hour:
  - `/api/contact`: 5/hr
  - `/api/newsletter`: 3/hr
  - `/api/reactions`: 30/hr
  - `/api/views`: 60/hr

## Key Dependencies
- **next** 16.2.2, **react** 19.2.4
- **@supabase/supabase-js** + **@supabase/ssr** — DB + auth
- **next-intl** — i18n routing, messages, translations
- **next-themes** — dark/light mode toggle
- **@sentry/nextjs** — error monitoring
- **@upstash/ratelimit** + **@upstash/redis** — rate limiting
- **resend** — transactional email (contact + newsletter)
- **react-hook-form** + **zod** + **@hookform/resolvers** — forms
- **framer-motion** — animations
- **recharts** — dashboard charts
- **@radix-ui/react-accordion**, **@radix-ui/react-dialog**,
  **@radix-ui/react-tabs** — UI primitives
- **cmdk** — command palette
- **@dnd-kit/core** + **@dnd-kit/sortable** — drag reorder
- **@tiptap/react** + **@tiptap/starter-kit** — rich text editor
- **next-mdx-remote** + **rehype-pretty-code** — MDX rendering
- **@vercel/og** — dynamic OG image generation
- **lightweight-charts** — finance charts
- **shadcn** + **tailwind-merge** + **class-variance-authority** +
  **clsx** — styling utilities

## New Public Pages (v3)
- `/[locale]/gallery` — full photo gallery with masonry grid,
  category filter (layoutId underline), lightbox. Uses
  `PhotoGalleryFull` from `components/home/photo-gallery.tsx`
- `/[locale]/projects` — bento grid of personal projects with
  tag filter. Uses `PersonalProjectsFull` from
  `components/home/personal-projects.tsx`
- Both check `section_visibility` and return `notFound()` if
  disabled

## Homepage Section Components (redesigned in v3)
- `components/home/hero.tsx` — cover image + parallax
- `components/home/kpi-stats.tsx` — bold typographic counters
  (no framer-motion, uses rAF + IntersectionObserver)
- `components/home/career-timeline.tsx` — center vertical
  timeline, alternating cards, SVG scroll-draw line
- `components/home/testimonials.tsx` — editorial quote carousel,
  Cormorant Garamond italic font, auto-rotate 6s
- `components/home/photo-gallery.tsx` — masonry grid + lightbox,
  exports both `PhotoGallery` (homepage, max 6) and
  `PhotoGalleryFull` (gallery page, with filters)
- `components/home/personal-projects.tsx` — bento grid,
  exports both `PersonalProjects` (homepage) and
  `PersonalProjectsFull` (projects page, with tag filter)
- `components/home/hobbies-section.tsx` — pastel icon cards,
  auto-fill grid, CSS wiggle animation
- `components/home/now-section.tsx` — sticky-note pinboard,
  scattered rotation, Caveat handwriting font
- `components/blog/blog-list.tsx` — editorial magazine layout
  with hero card + mixed grid, reaction counts from
  `getBlogReactionCounts()` cached query

## New Cached Query
- `getBlogReactionCounts()` in `lib/supabase/queries.ts` —
  aggregates all blog_reactions into `{ [post_id]: counts }`,
  cached 30min with tag `"content"`. Used by blog listing page.

## OG Image Generator (`app/api/og/route.tsx`)
- Edge runtime, fetches site_identity + profile from Supabase
- `?type=blog&title=...&category=...` — blog OG with avatar +
  "By [name]" footer, category badge
- `?type=default` — homepage OG with centered avatar, cover
  image background (if set), site name + tagline
- Params: title, subtitle, category, type
