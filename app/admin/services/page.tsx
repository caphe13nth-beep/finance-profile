"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminCreate, adminUpdate, adminDeleteRow, adminReorder } from "@/app/actions/admin-crud";
import { AdminShell } from "@/components/admin/admin-shell";
import { FormModal } from "@/components/admin/form-modal";
import { Plus, Pencil, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";

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

  function openNew() { setModal({ open: true, item: { ...EMPTY, sort_order: items.length } }); }
  function openEdit(s: Service) { setModal({ open: true, item: { ...s } }); }
  function close() { setModal({ open: false, item: null }); }
  function setField(k: string, v: unknown) { setModal((m) => ({ ...m, item: { ...m.item!, [k]: v } })); }

  function save() {
    const s = modal.item;
    if (!s?.title) return;
    const data: Record<string, unknown> = {
      title: s.title, description: s.description || null, features: s.features?.filter(Boolean) ?? [],
      price: s.price ?? null, cta_label: s.cta_label || null, sort_order: s.sort_order ?? 0,
    };
    start(async () => {
      if (s.id) await adminUpdate("services", s.id, data, "/admin/services");
      else await adminCreate("services", data, "/admin/services");
      close(); load();
    });
  }

  function del(id: string) { if (!confirm("Delete?")) return; start(async () => { await adminDeleteRow("services", id, "/admin/services"); load(); }); }

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[next]] = [newItems[next], newItems[index]];
    const reordered = newItems.map((item, i) => ({ id: item.id, sort_order: i }));
    setItems(newItems.map((item, i) => ({ ...item, sort_order: i })));
    start(async () => { await adminReorder("services", reordered, "/admin/services"); });
  }

  return (
    <AdminShell title="Services" description={`${items.length} services`}
      actions={<button onClick={openNew} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark"><Plus className="h-4 w-4" /> New</button>}>
      <div className="overflow-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50 text-left text-xs font-medium text-muted-foreground">
            <th className="w-10 px-2 py-3"><GripVertical className="h-4 w-4 mx-auto text-muted-foreground/50" /></th>
            <th className="px-4 py-3">Title</th><th className="px-4 py-3">Price</th><th className="px-4 py-3 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {items.map((s, i) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-2 py-3"><div className="flex flex-col items-center gap-0.5">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20"><ArrowUp className="h-3 w-3" /></button>
                  <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20"><ArrowDown className="h-3 w-3" /></button>
                </div></td>
                <td className="px-4 py-3 font-medium">{s.title}</td>
                <td className="px-4 py-3 font-mono text-muted-foreground">{s.price != null ? `$${s.price.toLocaleString()}` : "—"}</td>
                <td className="px-4 py-3"><div className="flex justify-end gap-1">
                  <button onClick={() => openEdit(s)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => del(s.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No services.</td></tr>}
          </tbody>
        </table>
      </div>
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
            <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-50">{pending ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </FormModal>
    </AdminShell>
  );
}
