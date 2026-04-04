"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminCreate, adminUpdate, adminDeleteRow, adminReorder } from "@/app/actions/admin-crud";
import { AdminShell } from "@/components/admin/admin-shell";
import { FormModal } from "@/components/admin/form-modal";
import { SortableList } from "@/components/admin/sortable-list";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Service { id: string; title: string; description: string | null; features: string[] | null; price: number | null; cta_label: string | null; sort_order: number; }
const EMPTY: Partial<Service> = { title: "", description: "", features: [], price: null, cta_label: "", sort_order: 0 };
const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";

export default function AdminServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Service> | null }>({ open: false, item: null });
  const [pending, start] = useTransition();

  async function load() {
    const { data } = await createClient().from("services").select("*").order("sort_order", { ascending: true });
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  function close() { setModal({ open: false, item: null }); }
  function setField(k: string, v: unknown) { setModal((m) => ({ ...m, item: { ...m.item!, [k]: v } })); }

  function save() {
    const s = modal.item; if (!s?.title) return;
    const data: Record<string, unknown> = { title: s.title, description: s.description || null, features: s.features?.filter(Boolean) ?? [], price: s.price ?? null, cta_label: s.cta_label || null, sort_order: s.sort_order ?? 0 };
    start(async () => {
      if (s.id) await adminUpdate("services", s.id, data, "/admin/services");
      else await adminCreate("services", data, "/admin/services");
      close(); load();
    });
  }

  function del(id: string) { if (!confirm("Delete?")) return; start(async () => { await adminDeleteRow("services", id, "/admin/services"); load(); }); }

  function handleReorder(reordered: { id: string; sort_order: number }[]) {
    start(async () => { await adminReorder("services", reordered, "/admin/services"); });
  }

  return (
    <AdminShell title="Services" description={`${items.length} services`}
      actions={<button onClick={() => setModal({ open: true, item: { ...EMPTY, sort_order: items.length } })} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80"><Plus className="h-4 w-4" /> New</button>}>

      {items.length > 0 ? (
        <SortableList items={items} onReorder={handleReorder} renderItem={(s, dragHandle) => (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            {dragHandle}
            <div className="min-w-0 flex-1">
              <p className="font-medium">{s.title}</p>
              <p className="text-sm text-muted-foreground">{s.price != null ? `$${s.price.toLocaleString()}` : "No price set"}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setModal({ open: true, item: { ...s } })} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => del(s.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        )} />
      ) : (
        <p className="py-8 text-center text-muted-foreground">No services.</p>
      )}

      <FormModal title={modal.item?.id ? "Edit Service" : "New Service"} open={modal.open} onClose={close}>
        <div className="space-y-4">
          <div><label className={labelCls}>Title *</label><input value={modal.item?.title ?? ""} onChange={(e) => setField("title", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Description</label><textarea value={modal.item?.description ?? ""} onChange={(e) => setField("description", e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          <div><label className={labelCls}>Features (one per line)</label><textarea value={(modal.item?.features ?? []).join("\n")} onChange={(e) => setField("features", e.target.value.split("\n").filter(Boolean))} rows={4} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Price</label><input type="number" value={modal.item?.price ?? ""} onChange={(e) => setField("price", e.target.value ? +e.target.value : null)} className={inputCls} /></div>
            <div><label className={labelCls}>CTA Label</label><input value={modal.item?.cta_label ?? ""} onChange={(e) => setField("cta_label", e.target.value)} className={inputCls} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={close} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80 disabled:opacity-50">{pending ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </FormModal>
    </AdminShell>
  );
}
