"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminCreate, adminUpdate } from "@/app/actions/admin-crud";
import { AdminShell } from "@/components/admin/admin-shell";
import { FormModal } from "@/components/admin/form-modal";
import { Plus, Pencil } from "lucide-react";

interface MediaItem { id: string; title: string; outlet: string | null; url: string | null; date: string | null; type: string | null; thumbnail_url: string | null; }
const EMPTY: Partial<MediaItem> = { title: "", outlet: "", url: "", date: "", type: "article", thumbnail_url: "" };
const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<MediaItem> | null }>({ open: false, item: null });
  const [pending, start] = useTransition();

  async function load() { const { data } = await createClient().from("media_appearances").select("*").order("date", { ascending: false }); setItems(data ?? []); }
  useEffect(() => { load(); }, []);

  function setField(k: string, v: unknown) { setModal((m) => ({ ...m, item: { ...m.item!, [k]: v } })); }
  function close() { setModal({ open: false, item: null }); }

  function save() {
    const m = modal.item; if (!m?.title) return;
    const data: Record<string, unknown> = { title: m.title, outlet: m.outlet || null, url: m.url || null, date: m.date || null, type: m.type || "article", thumbnail_url: m.thumbnail_url || null };
    start(async () => {
      if (m.id) await adminUpdate("media_appearances", m.id, data, "/admin/media");
      else await adminCreate("media_appearances", data, "/admin/media");
      close(); load();
    });
  }

  return (
    <AdminShell title="Media Appearances" description={`${items.length} appearances`}
      actions={<button onClick={() => setModal({ open: true, item: { ...EMPTY } })} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark"><Plus className="h-4 w-4" /> New</button>}>
      <div className="overflow-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50 text-left text-xs font-medium text-muted-foreground">
            <th className="px-4 py-3">Title</th><th className="px-4 py-3">Outlet</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{m.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.outlet ?? "—"}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{m.type}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{m.date ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setModal({ open: true, item: { ...m } })} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No media appearances.</td></tr>}
          </tbody>
        </table>
      </div>
      <FormModal title={modal.item?.id ? "Edit" : "New Media Appearance"} open={modal.open} onClose={close}>
        <div className="space-y-4">
          <div><label className={labelCls}>Title *</label><input value={modal.item?.title ?? ""} onChange={(e) => setField("title", e.target.value)} className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Outlet</label><input value={modal.item?.outlet ?? ""} onChange={(e) => setField("outlet", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Type</label><select value={modal.item?.type ?? "article"} onChange={(e) => setField("type", e.target.value)} className={inputCls}><option>article</option><option>podcast</option><option>video</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>URL</label><input value={modal.item?.url ?? ""} onChange={(e) => setField("url", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Date</label><input type="date" value={modal.item?.date ?? ""} onChange={(e) => setField("date", e.target.value)} className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Thumbnail URL</label><input value={modal.item?.thumbnail_url ?? ""} onChange={(e) => setField("thumbnail_url", e.target.value)} className={inputCls} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={close} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-50">{pending ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </FormModal>
    </AdminShell>
  );
}
