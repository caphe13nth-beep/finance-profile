"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminCreate, adminUpdate, adminReorder } from "@/app/actions/admin-crud";
import { AdminShell } from "@/components/admin/admin-shell";
import { FormModal } from "@/components/admin/form-modal";
import { SortableList } from "@/components/admin/sortable-list";
import { Plus, Pencil } from "lucide-react";

interface Entry { id: string; year: number; title: string; organization: string | null; description: string | null; sort_order: number; }
const EMPTY: Partial<Entry> = { year: new Date().getFullYear(), title: "", organization: "", description: "", sort_order: 0 };
const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";

export default function AdminTimelinePage() {
  const [items, setItems] = useState<Entry[]>([]);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Entry> | null }>({ open: false, item: null });
  const [pending, start] = useTransition();

  async function load() { const { data } = await createClient().from("career_timeline").select("*").order("sort_order"); setItems(data ?? []); }
  useEffect(() => { load(); }, []);

  function setField(k: string, v: unknown) { setModal((m) => ({ ...m, item: { ...m.item!, [k]: v } })); }
  function close() { setModal({ open: false, item: null }); }

  function save() {
    const e = modal.item; if (!e?.title || !e?.year) return;
    const data: Record<string, unknown> = { year: e.year, title: e.title, organization: e.organization || null, description: e.description || null, sort_order: e.sort_order ?? 0 };
    start(async () => {
      if (e.id) await adminUpdate("career_timeline", e.id, data, "/admin/timeline");
      else await adminCreate("career_timeline", data, "/admin/timeline");
      close(); load();
    });
  }

  return (
    <AdminShell title="Career Timeline" description={`${items.length} entries`}
      actions={<button onClick={() => setModal({ open: true, item: { ...EMPTY, sort_order: items.length } })} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80"><Plus className="h-4 w-4" /> New</button>}>

      {items.length > 0 ? (
        <SortableList items={items} onReorder={(r) => start(async () => { await adminReorder("career_timeline", r, "/admin/timeline"); })} renderItem={(e, dragHandle) => (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            {dragHandle}
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent">{e.year}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{e.title}</p>
              {e.organization && <p className="text-sm text-muted-foreground">{e.organization}</p>}
            </div>
            <button onClick={() => setModal({ open: true, item: { ...e } })} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
          </div>
        )} />
      ) : (
        <p className="py-8 text-center text-muted-foreground">No timeline entries.</p>
      )}

      <FormModal title={modal.item?.id ? "Edit Entry" : "New Entry"} open={modal.open} onClose={close}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Year *</label><input type="number" value={modal.item?.year ?? ""} onChange={(e) => setField("year", +e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Title *</label><input value={modal.item?.title ?? ""} onChange={(e) => setField("title", e.target.value)} className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Organization</label><input value={modal.item?.organization ?? ""} onChange={(e) => setField("organization", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Description</label><textarea value={modal.item?.description ?? ""} onChange={(e) => setField("description", e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={close} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80 disabled:opacity-50">{pending ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </FormModal>
    </AdminShell>
  );
}
