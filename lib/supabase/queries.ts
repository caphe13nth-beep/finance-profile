import { createClient } from "./server";

// ── Profiles ──────────────────────────────────────────────
export async function getProfile() {
  const supabase = await createClient();
  return supabase.from("profiles").select("*").limit(1).single();
}

// ── Blog Posts ────────────────────────────────────────────
export async function getPublishedPosts() {
  const supabase = await createClient();
  return supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
}

export async function getPostBySlug(slug: string) {
  const supabase = await createClient();
  return supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
}

// ── Services ──────────────────────────────────────────────
export async function getServices() {
  const supabase = await createClient();
  return supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
}

// ── Testimonials ──────────────────────────────────────────
export async function getTestimonials() {
  const supabase = await createClient();
  return supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true });
}

// ── Case Studies ──────────────────────────────────────────
export async function getCaseStudies() {
  const supabase = await createClient();
  return supabase
    .from("case_studies")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function getCaseStudy(id: string) {
  const supabase = await createClient();
  return supabase.from("case_studies").select("*").eq("id", id).single();
}

// ── Media Appearances ─────────────────────────────────────
export async function getMediaAppearances() {
  const supabase = await createClient();
  return supabase
    .from("media_appearances")
    .select("*")
    .order("date", { ascending: false });
}

// ── Career Timeline ──────────────────────────────────────
export async function getCareerTimeline() {
  const supabase = await createClient();
  return supabase
    .from("career_timeline")
    .select("*")
    .order("sort_order", { ascending: true });
}

// ── Market Insights ──────────────────────────────────────
export async function getMarketInsights() {
  const supabase = await createClient();
  return supabase
    .from("market_insights")
    .select("*")
    .order("published_at", { ascending: false });
}

// ── Resources ────────────────────────────────────────────
export async function getResources() {
  const supabase = await createClient();
  return supabase
    .from("resources")
    .select("*")
    .order("sort_order", { ascending: true });
}

// ── Personal Projects ────────────────────────────────────
export async function getPersonalProjects() {
  const supabase = await createClient();
  return supabase
    .from("personal_projects")
    .select("*")
    .order("sort_order", { ascending: true });
}

// ── Photo Gallery ────────────────────────────────────────
export async function getPhotoGallery() {
  const supabase = await createClient();
  return supabase
    .from("photo_gallery")
    .select("*")
    .order("sort_order", { ascending: true });
}

// ── Hobbies & Interests ──────────────────────────────────
export async function getHobbiesInterests() {
  const supabase = await createClient();
  return supabase
    .from("hobbies_interests")
    .select("*")
    .order("sort_order", { ascending: true });
}
