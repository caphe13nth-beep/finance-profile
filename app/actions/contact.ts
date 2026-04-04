"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactState {
  success: boolean;
  error: string | null;
}

export async function submitContactAction(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = formData.get("name");
  const email = formData.get("email");
  const subject = formData.get("subject");
  const message = formData.get("message");

  if (
    !name ||
    !email ||
    !message ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string"
  ) {
    return { success: false, error: "Please fill in all required fields." };
  }

  if (!email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  // Insert into Supabase
  const supabase = await createClient();
  const { error: dbError } = await supabase
    .from("contact_submissions")
    .insert({
      name,
      email,
      subject: typeof subject === "string" ? subject : null,
      message,
    });

  if (dbError) {
    return { success: false, error: "Failed to submit. Please try again." };
  }

  // Send notification email via Resend
  try {
    await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: [process.env.CONTACT_EMAIL ?? email],
      subject: `New Contact: ${typeof subject === "string" ? subject : "No subject"}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${typeof subject === "string" ? subject : "N/A"}\n\nMessage:\n${message}`,
    });
  } catch {
    // Email failure is non-critical — submission was already saved
  }

  return { success: true, error: null };
}
