import { createClient } from "./server";
import { createAdminClient } from "./admin";

// ═══════════════════════════════════════════════════════════
// PUBLIC INSERTS (anon-safe — RLS allows these)
// ═══════════════════════════════════════════════════════════

export async function subscribeNewsletter(email: string) {
  const supabase = await createClient();
  return supabase.from("newsletter_subscribers").insert({ email });
}

export async function submitContact(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const supabase = await createClient();
  return supabase.from("contact_submissions").insert(data);
}

// ═══════════════════════════════════════════════════════════
// ADMIN CRUD (service-role — bypasses RLS)
// Call only from server-side code (Route Handlers, Server Functions)
// ═══════════════════════════════════════════════════════════

type TableName =
  | "profiles"
  | "blog_posts"
  | "case_studies"
  | "services"
  | "testimonials"
  | "market_insights"
  | "newsletter_subscribers"
  | "contact_submissions"
  | "media_appearances"
  | "career_timeline";

export function adminGetAll(table: TableName) {
  const supabase = createAdminClient();
  return supabase.from(table).select("*");
}

export function adminGetById(table: TableName, id: string) {
  const supabase = createAdminClient();
  return supabase.from(table).select("*").eq("id", id).single();
}

export function adminInsert(table: TableName, data: Record<string, unknown>) {
  const supabase = createAdminClient();
  return supabase.from(table).insert(data).select().single();
}

export function adminUpdate(
  table: TableName,
  id: string,
  data: Record<string, unknown>
) {
  const supabase = createAdminClient();
  return supabase.from(table).update(data).eq("id", id).select().single();
}

export function adminDelete(table: TableName, id: string) {
  const supabase = createAdminClient();
  return supabase.from(table).delete().eq("id", id);
}
