"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteSettings } from "@/types/settings";

// Inline minimal defaults so this module has zero server-side imports
const FALLBACK: SiteSettings = {
  section_visibility: {
    hero: true, stats_bar: true, latest_insights: true, featured_case_study: true,
    career_timeline: true, testimonials: true, newsletter_cta: true, services_preview: true,
    media_appearances: true, personal_intro: true, photo_gallery: true, hobbies: true,
    personal_projects: true, what_i_do: true, now_section: true,
    finance_ticker: false, calculators: false, market_insights: false,
  },
  page_visibility: {
    about: true, services: true, portfolio: true, blog: true,
    contact: true, resources: false, tools: false, market_insights: false,
  },
  site_identity: {
    site_name: "FinanceProfile", tagline: "Finance Professional & Advisor",
    logo_url: null, favicon_url: null, og_image_url: null, site_mode: "hybrid",
    footer_text: "All rights reserved.",
  },
  seo_defaults: { title_template: "%s", default_description: "", google_analytics_id: "", posthog_key: "" },
  hero_content: {
    heading: "Welcome", subheading: "", description: "",
    cta_primary_text: "", cta_primary_link: "/", cta_secondary_text: "", cta_secondary_link: "/",
    show_cta_tertiary: false, cta_tertiary_text: "", background_style: "none",
  },
  stats_bar: { stats: [] },
  social_links: { linkedin: "", twitter: "", youtube: "", medium: "", github: "", instagram: "", tiktok: "", facebook: "" },
  now_section: { last_updated: "", items: [] },
  theme: {
    preset: "default", border_radius: "0.625rem", enable_dark_mode_toggle: true, default_dark: true,
    colors: { primary: "#0F172A", secondary: "#E2E8F0", background: "#F8FAFC", accent: "#10B981", accent_secondary: "#D4A373", card_bg: "#FFFFFF", text_primary: "#0F172A", text_secondary: "#64748B", border: "#E2E8F0" },
    dark_colors: { primary: "#F8FAFC", secondary: "#334155", background: "#0F172A", accent: "#10B981", accent_secondary: "#D4A373", card_bg: "#1E293B", text_primary: "#F8FAFC", text_secondary: "#94A3B8", border: "rgba(248,250,252,0.1)" },
    fonts: { heading: "Space Grotesk", body: "Manrope", mono: "JetBrains Mono" },
  },
};

const SettingsContext = createContext<SiteSettings>(FALLBACK);

export function SettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: ReactNode;
}) {
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Access site settings from any client component.
 * Returns defaults if provider is missing — never throws.
 */
export function useSettings(): SiteSettings {
  return useContext(SettingsContext);
}
