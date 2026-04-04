// Re-export types and functions from their canonical locations.
// Types live in types/settings.ts, fetch logic in lib/supabase/settings.ts,
// provider in lib/settings-provider.tsx.

export type {
  SectionVisibility,
  PageVisibility,
  SiteIdentity,
  SeoDefaults,
  HeroContent,
  StatItem,
  StatsBar,
  SocialLinks,
  NowItem,
  NowSection,
  SiteSettings,
} from "@/types/settings";

export { fetchAllSettings as getSiteSettings, SETTINGS_DEFAULTS } from "@/lib/supabase/settings";
