"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateSetting(key: string, value: unknown) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("site_settings")
    .update({ value })
    .eq("key", key);

  if (error) return { error: error.message };

  // Revalidate all public pages since settings affect layout/nav
  revalidatePath("/", "layout");
  return { error: null };
}
