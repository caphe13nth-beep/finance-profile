# Upgrade Build Plan: Personal Finance Profile Web App v2

## Building on the completed base — all new features
Read CLAUDE.md and /app/CLAUDE.md before starting
---

## Upgrade A — Admin Site Configurator (Days 1–3)

Everything controllable from admin, no code changes needed.

### A.1 New Supabase Table: `site_settings`
Read CLAUDE.md and /app/CLAUDE.md before starting
```sql
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Section visibility toggles
INSERT INTO site_settings (key, value) VALUES
('section_visibility', '{
  "hero": true,
  "stats_bar": true,
  "latest_insights": true,
  "featured_case_study": true,
  "career_timeline": true,
  "testimonials": true,
  "newsletter_cta": true,
  "services_preview": true,
  "finance_ticker": false,
  "calculators": false,
  "market_insights": false,
  "media_appearances": true
}');

-- Page visibility (controls navbar + routing)
INSERT INTO site_settings (key, value) VALUES
('page_visibility', '{
  "about": true,
  "services": true,
  "portfolio": true,
  "blog": true,
  "resources": false,
  "contact": true,
  "tools": false,
  "market_insights": false
}');

-- Site identity
INSERT INTO site_settings (key, value) VALUES
('site_identity', '{
  "site_name": "Your Name",
  "tagline": "Finance Professional & Advisor",
  "logo_url": null,
  "favicon_url": null,
  "og_image_url": null,
  "site_mode": "hybrid",
  "footer_text": "© 2026 Your Name. All rights reserved."
}');

-- SEO defaults
INSERT INTO site_settings (key, value) VALUES
('seo_defaults', '{
  "title_template": "%s | Your Name",
  "default_description": "Personal profile and finance insights",
  "google_analytics_id": "",
  "posthog_key": ""
}');

-- Hero content (editable from admin)
INSERT INTO site_settings (key, value) VALUES
('hero_content', '{
  "heading": "Your Name",
  "subheading": "Finance Professional & Advisor",
  "description": "Helping businesses and investors make smarter financial decisions.",
  "cta_primary_text": "View Insights",
  "cta_primary_link": "/blog",
  "cta_secondary_text": "Book a Consultation",
  "cta_secondary_link": "/contact",
  "show_cta_tertiary": true,
  "cta_tertiary_text": "Download CV",
  "background_style": "grid"
}');

-- Stats bar content
INSERT INTO site_settings (key, value) VALUES
('stats_bar', '{
  "stats": [
    { "label": "Years Experience", "value": 12, "suffix": "+", "icon": "clock" },
    { "label": "Assets Managed", "value": 50, "suffix": "M+", "prefix": "$", "icon": "trending-up" },
    { "label": "Clients", "value": 200, "suffix": "+", "icon": "users" },
    { "label": "Articles", "value": 85, "suffix": "", "icon": "file-text" },
    { "label": "Avg ROI", "value": 18, "suffix": "%", "icon": "bar-chart" }
  ]
}');

-- Social links
INSERT INTO site_settings (key, value) VALUES
('social_links', '{
  "linkedin": "",
  "twitter": "",
  "youtube": "",
  "medium": "",
  "github": "",
  "instagram": "",
  "tiktok": "",
  "facebook": ""
}');
```

### A.2 Admin Settings Pages
Read CLAUDE.md and /app/CLAUDE.md before starting
Build under `/admin/settings/`:

| Route | Controls |
|---|---|
| `/admin/settings/general` | Site name, tagline, logo upload, site mode (personal / finance / hybrid), footer text |
| `/admin/settings/sections` | Toggle switches for every homepage section |
| `/admin/settings/pages` | Toggle switches for every page (auto-updates navbar) |
| `/admin/settings/hero` | Edit hero heading, subheading, description, CTA buttons, background style |
| `/admin/settings/stats` | Edit each stat card (label, value, icon, prefix/suffix), add/remove/reorder |
| `/admin/settings/social` | Social media URLs |
| `/admin/settings/seo` | Default SEO, analytics IDs |

**Claude Code prompt:**

> "Build an admin settings page at /admin/settings/sections with a list of all homepage sections. Each row shows the section name with a toggle switch. Toggling calls a server action that updates the `section_visibility` key in `site_settings` and revalidates the homepage. Use shadcn Switch components."

### A.3 Settings Provider
Read CLAUDE.md and /app/CLAUDE.md before starting
Create a React context that fetches all settings once and passes them down:

```
src/lib/settings-provider.tsx
```

The root layout fetches settings server-side and wraps the app. Every component reads from this context instead of hardcoding content.

### A.4 Conditional Rendering Pattern

Every section and navbar link reads from settings:

```tsx
// Homepage
const { section_visibility } = settings
return (
  <>
    {section_visibility.hero && <HeroSection content={heroContent} />}
    {section_visibility.stats_bar && <StatsBar stats={statsBar} />}
    {section_visibility.career_timeline && <TimelineSection />}
    ...
  </>
)

// Navbar — filter links by page_visibility
const navLinks = allLinks.filter(link => page_visibility[link.key])
```

---

## Upgrade B — Theme Engine (Days 4–6)

### B.1 Theme Settings in Supabase
Read CLAUDE.md and /app/CLAUDE.md before starting
```sql
INSERT INTO site_settings (key, value) VALUES
('theme', '{
  "preset": "corporate",
  "colors": {
    "primary": "#0F172A",
    "secondary": "#334155",
    "background": "#F8FAFC",
    "accent": "#10B981",
    "accent_secondary": "#D4A373",
    "card_bg": "#FFFFFF",
    "text_primary": "#0F172A",
    "text_secondary": "#64748B",
    "border": "#E2E8F0"
  },
  "dark_colors": {
    "primary": "#F8FAFC",
    "secondary": "#CBD5E1",
    "background": "#0B0F19",
    "accent": "#10B981",
    "accent_secondary": "#D4A373",
    "card_bg": "#1E293B",
    "text_primary": "#F8FAFC",
    "text_secondary": "#94A3B8",
    "border": "#334155"
  },
  "fonts": {
    "heading": "Space Grotesk",
    "body": "Manrope",
    "mono": "JetBrains Mono"
  },
  "border_radius": "0.5rem",
  "enable_dark_mode_toggle": true,
  "default_dark": false
}');
```

### B.2 Theme Presets
Read CLAUDE.md and /app/CLAUDE.md before starting
Build 5 presets the admin can pick from:

| Preset | Vibe | Primary | Accent | Heading Font |
|---|---|---|---|---|
| Corporate Finance | Navy + gold, trustworthy | #0F172A | #D4A373 | Space Grotesk |
| Modern Fintech | Dark + cyan, techy | #0B0F19 | #38BDF8 | Sora |
| Minimal Personal | Clean white, warm | #1A1A1A | #E76F51 | Playfair Display |
| Warm Creative | Earthy tones, approachable | #2D2A26 | #E9A820 | DM Serif Display |
| Dark Luxe | All dark, premium gold | #09090B | #C9A96E | Cormorant Garamond |

### B.3 Admin Theme Page
Read CLAUDE.md and /app/CLAUDE.md before starting
`/admin/settings/theme`:

- Preset selector with live preview thumbnails
- Color pickers for each color (override preset)
- Font family dropdowns (from Google Fonts)
- Border radius slider
- Dark mode toggle default
- **Live preview panel** — shows a mini version of the homepage with current theme

**Claude Code prompt:**

> "Build an admin theme settings page. At the top, show 5 preset cards the admin can click to apply. Below, show individual color pickers for each theme color using a color input. Include font dropdowns loaded from Google Fonts (preselected set of 15 fonts). Add a live preview iframe or mini-component that updates in real time as the admin changes settings. Save to Supabase site_settings on 'Save Theme' button."

### B.4 CSS Variable Injection

In the root layout, inject theme colors as CSS variables:

```tsx
<style>{`
  :root {
    --color-primary: ${theme.colors.primary};
    --color-accent: ${theme.colors.accent};
    --font-heading: ${theme.fonts.heading};
    /* ... */
  }
  .dark {
    --color-primary: ${theme.dark_colors.primary};
    /* ... */
  }
`}</style>
```

Replace all hardcoded Tailwind colors with CSS variable references. Update `tailwind.config.ts` to use CSS variables.

---

## Upgrade C — Personal Introduction Mode (Days 7–10)

Shift the site from pure finance to a flexible personal/professional profile.

### C.1 Site Mode Setting

The `site_identity.site_mode` field controls the overall feel:

| Mode | What changes |
|---|---|
| `personal` | Hides finance jargon, shows personal intro, hobbies, projects, photo gallery |
| `finance` | Full finance features, KPIs, market insights, calculators |
| `hybrid` | Everything available, admin toggles what to show |

### C.2 New Sections & Components for Personal Mode

**New table: `personal_projects`**

```sql
CREATE TABLE personal_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  link TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**New table: `photo_gallery`**

```sql
CREATE TABLE photo_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  category TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**New table: `hobbies_interests`**

```sql
CREATE TABLE hobbies_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0
);
```

### C.3 New Homepage Sections (Toggleable)

Add to `section_visibility`:

```json
{
  "personal_intro": true,
  "photo_gallery": true,
  "hobbies": true,
  "personal_projects": true,
  "what_i_do": true,
  "fun_facts": false,
  "now_section": true
}
```

**Personal Intro Section:**
A warm, story-driven bio block replacing the finance hero. Larger photo, casual tone, personal background.

**"What I'm Doing Now" Section (/now page concept):**
Short, frequently updated section — what you're currently working on, reading, learning.

```sql
INSERT INTO site_settings (key, value) VALUES
('now_section', '{
  "last_updated": "2026-04-01",
  "items": [
    { "emoji": "📚", "text": "Reading: The Psychology of Money" },
    { "emoji": "🏗️", "text": "Building a personal finance app" },
    { "emoji": "🎯", "text": "Training for a half marathon" },
    { "emoji": "📍", "text": "Based in Ho Chi Minh City" }
  ]
}');
```

**Photo Gallery Section:**
Masonry grid of personal photos with lightbox. Categories: travel, events, personal, work.

**Hobbies & Interests:**
Icon cards showing what you're into beyond work.

**Personal Projects Grid:**
Card grid for side projects, open source, creative work — not just finance case studies.

### C.4 Flexible About Page

The about page adapts based on site mode:

| Mode | About page shows |
|---|---|
| Personal | Long-form story, photo gallery, hobbies, personal values, fun facts |
| Finance | Career timeline, certifications, skills grid, download CV |
| Hybrid | Both — personal story at top, professional details below |

### C.5 Admin CRUD for New Content

| Admin Route | Table |
|---|---|
| `/admin/projects` | personal_projects |
| `/admin/gallery` | photo_gallery |
| `/admin/hobbies` | hobbies_interests |
| `/admin/settings/now` | now_section in site_settings |

---

## Upgrade D — Advanced Admin Dashboard (Days 11–13)

### D.1 Analytics Dashboard

`/admin/dashboard` upgrades:

- **Visitor stats** — integrate Vercel Analytics API or PostHog
- **Popular pages** chart (bar chart)
- **Popular blog posts** ranked list
- **Contact submissions** over time (line chart)
- **Subscriber growth** chart
- **Recent activity** feed (latest post, comment, submission)

**Claude Code prompt:**

> "Build an admin analytics dashboard at /admin/dashboard. Show 6 stat cards at top (total visitors, page views today, total posts, total subscribers, unread contacts, total projects). Below, add a line chart for subscriber growth over the last 30 days using Recharts, a bar chart for top 5 blog posts by views, and a recent activity feed showing the last 10 actions (new post, new subscriber, new contact). Fetch all data from Supabase."

### D.2 Content Scheduling

Add to `blog_posts`:

```sql
ALTER TABLE blog_posts ADD COLUMN scheduled_at TIMESTAMPTZ;
ALTER TABLE blog_posts ADD COLUMN status TEXT DEFAULT 'draft'
  CHECK (status IN ('draft', 'scheduled', 'published', 'archived'));
```

Admin can set a future publish date. A Supabase Edge Function or cron checks and auto-publishes.

### D.3 Drag-and-Drop Reordering

For sections that have `sort_order`:
- Services
- Testimonials
- Career timeline
- Hobbies
- Photo gallery
- Personal projects

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### D.4 Bulk Actions

On list pages:
- Select multiple items
- Bulk delete, publish, unpublish, archive
- Export selected to CSV

### D.5 Media Library

`/admin/media-library`:

- Browse all uploaded images across all Supabase Storage buckets
- Upload new files
- Copy URL
- Delete unused files
- Filter by bucket, search by filename
- Image preview grid

---

## Upgrade E — Interactive & Engagement Features (Days 14–17)

### E.1 Blog Reactions

```sql
CREATE TABLE blog_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'insightful', 'fire', 'bookmark')),
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, reaction, visitor_id)
);
```

Show reaction buttons at the bottom of each blog post. Use anonymous `visitor_id` from a cookie.

### E.2 Blog Views Counter

```sql
ALTER TABLE blog_posts ADD COLUMN view_count INT DEFAULT 0;
```

Increment via a lightweight API route on page load. Show on blog listing cards and admin dashboard.

### E.3 Table of Contents Improvements

- Auto-generated from heading structure
- Highlight current section on scroll
- Collapsible on mobile
- Reading progress bar at top

### E.4 Related Posts Algorithm

At the bottom of each blog post, show 3 related posts based on:
1. Same category
2. Shared tags
3. Most recent

### E.5 Comments System (Optional)

Option 1 — **Giscus** (GitHub Discussions-based, free, no backend):

```bash
# Just embed the Giscus script on blog posts
```

Option 2 — **Custom comments** with Supabase:

```sql
CREATE TABLE blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Admin approves comments before they appear.

### E.6 Newsletter Email Broadcasting

`/admin/newsletter`:

- Compose email with rich text editor
- Preview before sending
- Send to all active subscribers via Resend API
- Track sent history

```sql
CREATE TABLE newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  recipient_count INT DEFAULT 0,
  status TEXT DEFAULT 'draft'
);
```

---

## Upgrade F — Personal Touches & Micro-Interactions (Days 18–20)

### F.1 Custom Cursor (Optional)

Subtle custom cursor on desktop that changes on hover over interactive elements.

### F.2 Page Transitions

Smooth animated transitions between pages using Framer Motion `AnimatePresence`.

### F.3 Easter Eggs

- Konami code reveals a hidden message or animation
- Click the logo 5 times to trigger a fun animation

### F.4 Dynamic OG Images

Auto-generate Open Graph images for blog posts using `@vercel/og`:

```
src/app/api/og/route.tsx
```

Each blog post gets a unique OG image with the title, author photo, and category styled on a branded template.

### F.5 Command Palette (⌘K)

Add a global command palette for power users:

```bash
npm install cmdk
```

- Search blog posts
- Navigate to any page
- Toggle dark mode
- Quick actions

### F.6 Scroll-Triggered Animations

- Section headers animate in on scroll
- Stats count up when they enter the viewport
- Timeline entries stagger in
- Cards scale up subtly on scroll

### F.7 Back to Top Button

Floating button that appears after scrolling down, smooth scrolls to top.

---

## Upgrade G — Performance & Infrastructure (Days 21–22)

### G.1 Image Optimization Pipeline

- Supabase Storage → transform on upload (resize, compress)
- Use `next/image` with Supabase as a custom loader
- Generate blur placeholders with `plaiceholder`

```bash
npm install plaiceholder sharp
```

### G.2 Edge Caching Strategy

```
- Static pages: ISR with revalidate: 3600 (1 hour)
- Blog posts: ISR with revalidate: 1800 (30 min)
- Admin pages: no-store (always fresh)
- Settings: revalidate on save via revalidateTag('settings')
```

### G.3 Error Monitoring

```bash
npm install @sentry/nextjs
```

- Track client and server errors
- Performance monitoring
- Alert on spikes

### G.4 Rate Limiting

Protect API routes from spam:

```bash
npm install @upstash/ratelimit @upstash/redis
```

Apply to:
- `/api/contact` — 5 requests per hour per IP
- `/api/newsletter` — 3 requests per hour per IP

### G.5 Database Indexes

```sql
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC)
  WHERE is_published = true;
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_case_studies_industry ON case_studies(industry);
CREATE INDEX idx_contact_submissions_unread ON contact_submissions(created_at DESC)
  WHERE is_read = false;
```

---

## Upgrade H — Multilingual Support (Days 23–25) — Optional

### H.1 Setup

```bash
npm install next-intl
```

### H.2 Structure

```
src/app/
├── [locale]/
│   ├── (site)/
│   │   ├── page.tsx
│   │   ├── about/page.tsx
│   │   └── ...
│   └── layout.tsx
├── messages/
│   ├── en.json
│   └── vi.json      # Vietnamese
```

### H.3 CMS Content Translation

Add translatable fields to content tables:

```sql
ALTER TABLE blog_posts ADD COLUMN locale TEXT DEFAULT 'en';
ALTER TABLE blog_posts ADD COLUMN translation_of UUID REFERENCES blog_posts(id);
```

Admin can create blog posts per language and link translations together.

### H.4 Language Switcher

Add a language dropdown in the navbar that switches locale and preserves the current page.

---

## Updated Admin Structure (Complete)

```
/admin
├── /dashboard           — Analytics overview
├── /settings
│   ├── /general         — Site name, mode, logo, identity
│   ├── /sections        — Toggle homepage sections
│   ├── /pages           — Toggle site pages
│   ├── /hero            — Hero content editor
│   ├── /stats           — KPI stats editor
│   ├── /now             — "What I'm doing now" editor
│   ├── /social          — Social links
│   ├── /theme           — Theme presets, colors, fonts
│   └── /seo             — Default SEO, analytics keys
├── /profile             — Edit personal profile
├── /posts               — Blog CRUD + scheduling
├── /case-studies         — Case studies CRUD
├── /services            — Services CRUD + reorder
├── /testimonials        — Testimonials CRUD + reorder
├── /insights            — Market insights CRUD
├── /media               — Media appearances CRUD
├── /timeline            — Career timeline CRUD + reorder
├── /projects            — Personal projects CRUD
├── /gallery             — Photo gallery CRUD
├── /hobbies             — Hobbies & interests CRUD
├── /contacts            — Contact submissions inbox
├── /subscribers         — Newsletter subscribers + export
├── /newsletter          — Compose & send newsletters
└── /media-library       — Browse all uploaded files
```

---

## New Dependencies to Install

```bash
# Drag and drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Command palette
npm install cmdk

# OG image generation
npm install @vercel/og

# Image optimization
npm install plaiceholder sharp

# Error monitoring
npm install @sentry/nextjs

# Rate limiting
npm install @upstash/ratelimit @upstash/redis

# Multilingual (optional)
npm install next-intl
```

---

## Upgraded Timeline

| Upgrade | Days | Priority |
|---|---|---|
| A — Admin Site Configurator | 3 | Must have |
| B — Theme Engine | 3 | Must have |
| C — Personal Introduction Mode | 4 | Must have |
| D — Advanced Admin Dashboard | 3 | High |
| E — Engagement Features | 4 | High |
| F — Micro-Interactions & Polish | 3 | Medium |
| G — Performance & Infrastructure | 2 | High |
| H — Multilingual | 3 | Optional |
| **Total** | **~22–25 days** | |

---

## Updated CLAUDE.md Additions

Add these to your root `CLAUDE.md`:

```markdown
## Site Settings System
- All site configuration stored in `site_settings` table as JSONB
- Fetch settings in root layout via server component
- Pass down via SettingsProvider context
- Every homepage section checks section_visibility before rendering
- Navbar reads page_visibility to show/hide links
- Theme colors injected as CSS variables in root layout
- After any settings change, call revalidateTag('settings')

## Site Modes
- personal: warm, story-driven, hides finance jargon
- finance: full KPIs, market data, calculators
- hybrid: everything available, admin toggles visibility

## New Tables (v2)
- site_settings: key-value config store
- personal_projects: side projects and creative work
- photo_gallery: personal photos with categories
- hobbies_interests: interests and hobbies
- blog_reactions: post reactions (like, insightful, fire, bookmark)
- blog_comments: moderated comments
- newsletter_campaigns: email broadcast history
```
