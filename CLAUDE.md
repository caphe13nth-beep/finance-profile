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