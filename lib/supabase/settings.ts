import { createClient } from "./server";
import type { SiteSettings } from "@/types/settings";

const DEFAULTS: SiteSettings = {
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
    site_name: "Your Name", tagline: "Finance Professional & Advisor",
    logo_url: null, favicon_url: null, og_image_url: null, site_mode: "hybrid",
    footer_text: "© 2026 Your Name. All rights reserved.",
  },
  seo_defaults: {
    title_template: "%s | Your Name", default_description: "Personal profile and finance insights",
    google_analytics_id: "", posthog_key: "",
  },
  hero_content: {
    heading: "Your Name", subheading: "Finance Professional & Advisor",
    description: "Helping businesses and investors make smarter financial decisions.",
    cta_primary_text: "View Insights", cta_primary_link: "/blog",
    cta_secondary_text: "Book a Consultation", cta_secondary_link: "/contact",
    show_cta_tertiary: true, cta_tertiary_text: "Download CV", background_style: "grid",
  },
  stats_bar: { stats: [
    { label: "Years Experience", value: 12, suffix: "+", prefix: "", icon: "clock" },
    { label: "Assets Managed", value: 50, suffix: "M+", prefix: "$", icon: "trending-up" },
    { label: "Clients", value: 200, suffix: "+", prefix: "", icon: "users" },
    { label: "Articles", value: 85, suffix: "", prefix: "", icon: "file-text" },
    { label: "Avg ROI", value: 18, suffix: "%", prefix: "", icon: "bar-chart" },
  ]},
  social_links: {
    linkedin: "", twitter: "", youtube: "", medium: "",
    github: "", instagram: "", tiktok: "", facebook: "",
  },
  now_section: {
    last_updated: "2026-04-04",
    items: [
      { emoji: "📈", text: "Building investment strategies for Q2 2026" },
      { emoji: "✍️", text: "Writing a series on macro-economic trends" },
      { emoji: "🎙️", text: "Guest appearances on finance podcasts" },
      { emoji: "📚", text: "Reading: The Psychology of Money" },
    ],
  },
};

/**
 * Fetch all site_settings rows from Supabase and return
 * a typed SiteSettings object, merged with defaults.
 * Safe to call from server components and server actions.
 */
export async function fetchAllSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value");

    if (!data) return DEFAULTS;

    const map = Object.fromEntries(data.map((r) => [r.key, r.value]));

    return {
      section_visibility: { ...DEFAULTS.section_visibility, ...(map.section_visibility ?? {}) },
      page_visibility: { ...DEFAULTS.page_visibility, ...(map.page_visibility ?? {}) },
      site_identity: { ...DEFAULTS.site_identity, ...(map.site_identity ?? {}) },
      seo_defaults: { ...DEFAULTS.seo_defaults, ...(map.seo_defaults ?? {}) },
      hero_content: { ...DEFAULTS.hero_content, ...(map.hero_content ?? {}) },
      stats_bar: map.stats_bar ?? DEFAULTS.stats_bar,
      social_links: { ...DEFAULTS.social_links, ...(map.social_links ?? {}) },
      now_section: { ...DEFAULTS.now_section, ...(map.now_section ?? {}) },
    };
  } catch {
    return DEFAULTS;
  }
}

export { DEFAULTS as SETTINGS_DEFAULTS };
