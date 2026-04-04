"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminToggleField, adminDeleteRow } from "@/app/actions/admin-crud";
import { AdminShell } from "@/components/admin/admin-shell";
import { Trash2, Mail, MailOpen } from "lucide-react";

interface Submission { id: string; name: string; email: string; subject: string | null; message: string; created_at: string; is_read: boolean; }

export default function AdminContactsPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [pending, start] = useTransition();

  async function load() { const { data } = await createClient().from("contact_submissions").select("*").order("created_at", { ascending: false }); setItems(data ?? []); }
  useEffect(() => { load(); }, []);

  function markRead(id: string, read: boolean) {
    start(async () => { await adminToggleField("contact_submissions", id, "is_read", read, "/admin/contacts"); load(); });
  }

  function del(id: string) {
    if (!confirm("Delete this submission?")) return;
    start(async () => { await adminDeleteRow("contact_submissions", id, "/admin/contacts"); setSelected(null); load(); });
  }

  function open(s: Submission) {
    setSelected(s);
    if (!s.is_read) markRead(s.id, true);
  }

  const unread = items.filter((i) => !i.is_read).length;

  return (
    <AdminShell title="Contact Submissions" description={`${items.length} total · ${unread} unread`}>
      <div className="grid gap-6 lg:grid-cols-5">
        {/* List */}
        <div className="lg:col-span-2">
          <div className="space-y-1">
            {items.map((s) => (
              <button
                key={s.id}
                onClick={() => open(s)}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted/50 ${selected?.id === s.id ? "bg-muted" : ""}`}
              >
                {s.is_read ? <MailOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" /> : <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm truncate ${s.is_read ? "text-muted-foreground" : "font-semibold text-foreground"}`}>{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.subject ?? s.message.slice(0, 50)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/60">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
              </button>
            ))}
            {items.length === 0 && <p className="py-8 text-center text-muted-foreground">No submissions.</p>}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading text-lg font-bold">{selected.name}</h3>
                  <p className="text-sm text-muted-foreground">{selected.email}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => markRead(selected.id, !selected.is_read)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title={selected.is_read ? "Mark unread" : "Mark read"}>
                    {selected.is_read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </button>
                  <button onClick={() => del(selected.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {selected.subject && <p className="mt-3 font-medium">{selected.subject}</p>}
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{selected.message}</p>
              <p className="mt-4 text-xs text-muted-foreground/60">{new Date(selected.created_at).toLocaleString()}</p>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              Select a message to view
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
