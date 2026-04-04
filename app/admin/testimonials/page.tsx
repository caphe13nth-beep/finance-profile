"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminCreate, adminUpdate, adminDeleteRow } from "@/app/actions/admin-crud";
import { AdminShell } from "@/components/admin/admin-shell";
import { FormModal } from "@/components/admin/form-modal";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Testimonial { id: string; name: string; company: string | null; quote: string; avatar_url: string | null; sort_order: number; }
const EMPTY: Partial<Testimonial> = { name: "", company: "", quote: "", avatar_url: "", sort_order: 0 };
const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Testimonial> | null }>({ open: false, item: null });
  const [pending, start] = useTransition();

  async function load() { const { data } = await createClient().from("testimonials").select("*").order("sort_order"); setItems(data ?? []); }
  useEffect(() => { load(); }, []);

  function setField(k: string, v: unknown) { setModal((m) => ({ ...m, item: { ...m.item!, [k]: v } })); }
  function close() { setModal({ open: false, item: null }); }

  function save() {
    const t = modal.item; if (!t?.name || !t?.quote) return;
    const data: Record<string, unknown> = { name: t.name, company: t.company || null, quote: t.quote, avatar_url: t.avatar_url || null, sort_order: t.sort_order ?? 0 };
    start(async () => {
      if (t.id) await adminUpdate("testimonials", t.id, data, "/admin/testimonials");
      else await adminCreate("testimonials", data, "/admin/testimonials");
      close(); load();
    });
  }

  function del(id: string) { if (!confirm("Delete?")) return; start(async () => { await adminDeleteRow("testimonials", id, "/admin/testimonials"); load(); }); }

  return (
    <AdminShell title="Testimonials" description={`${items.length} testimonials`}
      actions={<button onClick={() => setModal({ open: true, item: { ...EMPTY, sort_order: items.length } })} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark"><Plus className="h-4 w-4" /> New</button>}>
      <div className="space-y-3">
        {items.map((t) => (
          <div key={t.id} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
            {t.avatar_url ? <img src={t.avatar_url} alt={t.name} className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 font-heading font-bold text-accent">{t.name.charAt(0)}</div>}
            <div className="min-w-0 flex-1">
              <p className="font-medium">{t.name}{t.company && <span className="text-muted-foreground"> — {t.company}</span>}</p>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setModal({ open: true, item: { ...t } })} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => del(t.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="py-8 text-center text-muted-foreground">No testimonials.</p>}
      </div>
      <FormModal title={modal.item?.id ? "Edit Testimonial" : "New Testimonial"} open={modal.open} onClose={close}>
        <div className="space-y-4">
          <div><label className={labelCls}>Name *</label><input value={modal.item?.name ?? ""} onChange={(e) => setField("name", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Company</label><input value={modal.item?.company ?? ""} onChange={(e) => setField("company", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Quote *</label><textarea value={modal.item?.quote ?? ""} onChange={(e) => setField("quote", e.target.value)} rows={4} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          <div><label className={labelCls}>Avatar URL</label><input value={modal.item?.avatar_url ?? ""} onChange={(e) => setField("avatar_url", e.target.value)} className={inputCls} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={close} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-50">{pending ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </FormModal>
    </AdminShell>
  );
}
