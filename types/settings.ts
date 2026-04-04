// ── Section Visibility ─────────────────────────────
export interface SectionVisibility {
  hero: boolean;
  stats_bar: boolean;
  latest_insights: boolean;
  featured_case_study: boolean;
  career_timeline: boolean;
  testimonials: boolean;
  newsletter_cta: boolean;
  services_preview: boolean;
  media_appearances: boolean;
  personal_intro: boolean;
  photo_gallery: boolean;
  hobbies: boolean;
  personal_projects: boolean;
  what_i_do: boolean;
  now_section: boolean;
  finance_ticker: boolean;
  calculators: boolean;
  market_insights: boolean;
}

// ── Page Visibility ────────────────────────────────
export interface PageVisibility {
  about: boolean;
  services: boolean;
  portfolio: boolean;
  blog: boolean;
  resources: boolean;
  contact: boolean;
  tools: boolean;
  market_insights: boolean;
}

// ── Site Identity ──────────────────────────────────
export interface SiteIdentity {
  site_name: string;
  tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  og_image_url: string | null;
  site_mode: "personal" | "finance" | "hybrid";
  footer_text: string;
}

// ── SEO Defaults ───────────────────────────────────
export interface SeoDefaults {
  title_template: string;
  default_description: string;
  google_analytics_id: string;
  posthog_key: string;
}

// ── Hero Content ───────────────────────────────────
export interface HeroContent {
  heading: string;
  subheading: string;
  description: string;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
  show_cta_tertiary: boolean;
  cta_tertiary_text: string;
  background_style: string;
}

// ── Stats Bar ──────────────────────────────────────
export interface StatItem {
  label: string;
  value: number;
  suffix: string;
  prefix: string;
  icon: string;
}

export interface StatsBar {
  stats: StatItem[];
}

// ── Social Links ───────────────────────────────────
export interface SocialLinks {
  linkedin: string;
  twitter: string;
  youtube: string;
  medium: string;
  github: string;
  instagram: string;
  tiktok: string;
  facebook: string;
}

// ── Now Section ────────────────────────────────────
export interface NowItem {
  emoji: string;
  text: string;
}

export interface NowSection {
  last_updated: string;
  items: NowItem[];
}

// ── Theme ──────────────────────────────────────────
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  accent: string;
  accent_secondary: string;
  card_bg: string;
  text_primary: string;
  text_secondary: string;
  border: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
  mono: string;
}

export interface ThemeSettings {
  preset: string;
  colors: ThemeColors;
  dark_colors: ThemeColors;
  fonts: ThemeFonts;
  border_radius: string;
  enable_dark_mode_toggle: boolean;
  default_dark: boolean;
}

// ── Combined Settings ──────────────────────────────
export interface SiteSettings {
  section_visibility: SectionVisibility;
  page_visibility: PageVisibility;
  site_identity: SiteIdentity;
  seo_defaults: SeoDefaults;
  hero_content: HeroContent;
  stats_bar: StatsBar;
  social_links: SocialLinks;
  now_section: NowSection;
  theme: ThemeSettings;
}
