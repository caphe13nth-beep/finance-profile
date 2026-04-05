import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  // Rate limit: 5 per hour per IP
  const limited = await rateLimit(request, "contact");
  if (limited) return limited;

  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message || typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error: dbError } = await supabase
      .from("contact_submissions")
      .insert({ name, email, subject: typeof subject === "string" ? subject : null, message });

    if (dbError) {
      return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
    }

    // Send notification email (non-blocking)
    try {
      await resend.emails.send({
        from: "Contact Form <onboarding@resend.dev>",
        to: [process.env.CONTACT_EMAIL ?? email],
        subject: `New Contact: ${typeof subject === "string" ? subject : "No subject"}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${typeof subject === "string" ? subject : "N/A"}\n\nMessage:\n${message}`,
      });
    } catch {
      // Email failure is non-critical
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
