"use server";

import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

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
  | "career_timeline"
  | "resources"
  | "personal_projects"
  | "photo_gallery"
  | "hobbies_interests";

function admin() {
  return createAdminClient();
}

function revalidateContent() {
  revalidateTag("content", { expire: 0 });
}

export async function adminCreate(
  table: TableName,
  data: Record<string, unknown>,
  _revalidate: string
) {
  const { error } = await admin().from(table).insert(data);
  if (error) return { error: error.message };
  revalidateContent();
  return { error: null };
}

export async function adminUpdate(
  table: TableName,
  id: string,
  data: Record<string, unknown>,
  _revalidate: string
) {
  const { error } = await admin().from(table).update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidateContent();
  return { error: null };
}

export async function adminDeleteRow(
  table: TableName,
  id: string,
  _revalidate: string
) {
  const { error } = await admin().from(table).delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateContent();
  return { error: null };
}

export async function adminToggleField(
  table: TableName,
  id: string,
  field: string,
  value: boolean,
  _revalidate: string
) {
  const { error } = await admin()
    .from(table)
    .update({ [field]: value })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateContent();
  return { error: null };
}

export async function adminReorder(
  table: TableName,
  items: { id: string; sort_order: number }[],
  _revalidate: string
) {
  const db = admin();
  for (const item of items) {
    await db.from(table).update({ sort_order: item.sort_order }).eq("id", item.id);
  }
  revalidateContent();
  return { error: null };
}
