"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const BATCH_SIZE = 50;

export async function createCampaign(subject: string, body: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("newsletter_campaigns")
    .insert({ subject, body, status: "draft" })
    .select()
    .single();

  if (error) return { error: error.message, id: null };
  revalidatePath("/admin/newsletter");
  return { error: null, id: data.id };
}

export async function sendCampaign(campaignId: string) {
  const supabase = createAdminClient();

  // Get campaign
  const { data: campaign, error: campError } = await supabase
    .from("newsletter_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (campError || !campaign) return { error: "Campaign not found" };
  if (campaign.status === "sent") return { error: "Already sent" };

  // Mark as sending
  await supabase
    .from("newsletter_campaigns")
    .update({ status: "sending" })
    .eq("id", campaignId);

  // Get all active subscribers
  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("email")
    .eq("is_active", true);

  if (!subscribers || subscribers.length === 0) {
    await supabase
      .from("newsletter_campaigns")
      .update({ status: "failed" })
      .eq("id", campaignId);
    return { error: "No active subscribers" };
  }

  // Send in batches
  let sentCount = 0;
  const emails = subscribers.map((s) => s.email);

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    try {
      await resend.emails.send({
        from: process.env.NEWSLETTER_FROM ?? "Newsletter <onboarding@resend.dev>",
        to: batch,
        subject: campaign.subject,
        html: campaign.body,
      });
      sentCount += batch.length;
    } catch {
      // Continue with remaining batches even if one fails
    }
  }

  // Update campaign
  await supabase
    .from("newsletter_campaigns")
    .update({
      status: sentCount > 0 ? "sent" : "failed",
      sent_at: new Date().toISOString(),
      recipient_count: sentCount,
    })
    .eq("id", campaignId);

  revalidatePath("/admin/newsletter");
  return { error: null, sent: sentCount };
}

export async function deleteCampaign(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("newsletter_campaigns")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/newsletter");
  return { error: null };
}
