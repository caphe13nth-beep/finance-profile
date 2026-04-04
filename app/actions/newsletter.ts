"use server";

import { createClient } from "@/lib/supabase/server";

export async function subscribeAction(
  _prev: { success: boolean; error: string | null },
  formData: FormData
) {
  const email = formData.get("email");

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: email.trim() });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "You're already subscribed!" };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }

  return { success: true, error: null };
}
