"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createCampaign, sendCampaign, deleteCampaign } from "@/app/actions/newsletter-campaign";
import { AdminShell } from "@/components/admin/admin-shell";
import { FormModal } from "@/components/admin/form-modal";
import { MdxEditor } from "@/components/admin/mdx-editor";
import { useToast } from "@/components/toast";
import {
  Send, Eye, Trash2, Mail, Clock, CheckCircle2,
  AlertCircle, Loader2, Users,
} from "lucide-react";

interface Campaign {
  id: string;
  subject: string;
  body: string;
  sent_at: string | null;
  recipient_count: number;
  status: string;
  created_at: string;
}

const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";

const STATUS_DISPLAY: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground" },
  sending: { label: "Sending...", cls: "bg-chart-2/10 text-chart-2" },
  sent: { label: "Sent", cls: "bg-accent/10 text-accent" },
  failed: { label: "Failed", cls: "bg-destructive/10 text-destructive" },
};

export default function AdminNewsletterPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);
  const [pending, start] = useTransition();
  const [sending, setSending] = useState<string | null>(null);
  const { toast } = useToast();

  async function load() {
    const { data } = await createClient()
      .from("newsletter_campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    setCampaigns(data ?? []);
  }

  useEffect(() => { load(); }, []);

  function handleSaveDraft() {
    if (!subject.trim() || !body.trim()) {
      toast("Subject and body are required", "error");
      return;
    }
    start(async () => {
      const { error } = await createCampaign(subject, body);
      if (error) {
        toast(error, "error");
      } else {
        toast("Draft saved", "success");
        setSubject("");
        setBody("");
        load();
      }
    });
  }

  function handleSend() {
    if (!subject.trim() || !body.trim()) {
      toast("Subject and body are required", "error");
      return;
    }
    if (!confirm("Send this newsletter to all active subscribers? This cannot be undone.")) return;

    start(async () => {
      // Create campaign first
      const { error: createError, id } = await createCampaign(subject, body);
      if (createError || !id) {
        toast(createError ?? "Failed to create campaign", "error");
        return;
      }
      // Then send
      setSending(id);
      const { error, sent } = await sendCampaign(id);
      setSending(null);
      if (error) {
        toast(error, "error");
      } else {
        toast(`Sent to ${sent} subscribers!`, "success");
        setSubject("");
        setBody("");
      }
      load();
    });
  }

  function handleSendExisting(id: string) {
    if (!confirm("Send this campaign to all active subscribers?")) return;
    setSending(id);
    start(async () => {
      const { error, sent } = await sendCampaign(id);
      setSending(null);
      if (error) toast(error, "error");
      else toast(`Sent to ${sent} subscribers!`, "success");
      load();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this campaign?")) return;
    start(async () => {
      await deleteCampaign(id);
      load();
    });
  }

  return (
    <AdminShell title="Newsletter" description="Compose and send email broadcasts">
      {/* Compose */}
      <div className="max-w-3xl rounded-2xl border border-border bg-card p-6">
        <h3 className="font-heading text-lg font-bold">Compose</h3>

        <div className="mt-4 space-y-4">
          <div>
            <label className={labelCls}>Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={inputCls}
              placeholder="Your newsletter subject line"
            />
          </div>

          <div>
            <label className={labelCls}>Body</label>
            <div className="mt-1">
              <MdxEditor value={body} onChange={setBody} />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPreview(true)}
              disabled={!subject.trim() || !body.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              <Eye className="h-4 w-4" /> Preview
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={pending || !subject.trim() || !body.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              <Mail className="h-4 w-4" /> Save Draft
            </button>
            <button
              onClick={handleSend}
              disabled={pending || !subject.trim() || !body.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80 disabled:opacity-50"
            >
              {pending && !sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Now
            </button>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <FormModal title="Email Preview" open={preview} onClose={() => setPreview(false)}>
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Subject</p>
            <p className="mt-1 font-semibold">{subject}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <div
              className="prose-preview text-sm"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>
        </div>
      </FormModal>

      {/* Past campaigns */}
      <div className="mt-8 max-w-3xl">
        <h3 className="font-heading text-lg font-bold">Past Campaigns</h3>

        {campaigns.length > 0 ? (
          <div className="mt-4 overflow-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Recipients</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const st = STATUS_DISPLAY[c.status] ?? STATUS_DISPLAY.draft;
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{c.subject}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>
                          {c.status === "sending" && <Loader2 className="h-3 w-3 animate-spin" />}
                          {c.status === "sent" && <CheckCircle2 className="h-3 w-3" />}
                          {c.status === "failed" && <AlertCircle className="h-3 w-3" />}
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {c.recipient_count > 0 ? (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {c.recipient_count}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {c.sent_at
                          ? new Date(c.sent_at).toLocaleDateString()
                          : new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {c.status === "draft" && (
                            <button
                              onClick={() => handleSendExisting(c.id)}
                              disabled={sending === c.id}
                              className="rounded-md p-1.5 text-accent hover:bg-accent/10"
                              title="Send"
                            >
                              {sending === c.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No campaigns yet.</p>
        )}
      </div>
    </AdminShell>
  );
}
