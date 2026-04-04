"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminCreate, adminUpdate, adminDeleteRow, adminReorder } from "@/app/actions/admin-crud";
import { AdminShell } from "@/components/admin/admin-shell";
import { FormModal } from "@/components/admin/form-modal";
import { ImageUpload } from "@/components/admin/image-upload";
import { SortableList } from "@/components/admin/sortable-list";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Hobby { id: string; title: string; description: string | null; icon: string | null; image_url: string | null; sort_order: number; }
const EMPTY: Partial<Hobby> = { title: "", description: "", icon: "heart", image_url: "", sort_order: 0 };
const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";
const textareaCls = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const ICON_OPTIONS = ["heart","music","camera","gaming","reading","art","fitness","travel","coffee","cooking","hiking","globe"];

export default function AdminHobbiesPage() {
  const [items, setItems] = useState<Hobby[]>([]);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Hobby> | null }>({ open: false, item: null });
  const [pending, start] = useTransition();

  async function load() { const { data } = await createClient().from("hobbies_interests").select("*").order("sort_order"); setItems(data ?? []); }
  useEffect(() => { load(); }, []);

  function setField(k: string, v: unknown) { setModal((m) => ({ ...m, item: { ...m.item!, [k]: v } })); }
  function close() { setModal({ open: false, item: null }); }

  function save() {
    const h = modal.item; if (!h?.title) return;
    const data: Record<string, unknown> = { title: h.title, description: h.description || null, icon: h.icon || null, image_url: h.image_url || null, sort_order: h.sort_order ?? 0 };
    start(async () => {
      if (h.id) await adminUpdate("hobbies_interests", h.id, data, "/admin/hobbies");
      else await adminCreate("hobbies_interests", data, "/admin/hobbies");
      close(); load();
    });
  }

  function del(id: string) { if (!confirm("Delete?")) return; start(async () => { await adminDeleteRow("hobbies_interests", id, "/admin/hobbies"); load(); }); }

  return (
    <AdminShell title="Hobbies & Interests" description={`${items.length} hobbies`}
      actions={<button onClick={() => setModal({ open: true, item: { ...EMPTY, sort_order: items.length } })} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80"><Plus className="h-4 w-4" /> New</button>}>

      <div className="max-w-2xl">
        {items.length > 0 ? (
          <SortableList items={items} onReorder={(r) => start(async () => { await adminReorder("hobbies_interests", r, "/admin/hobbies"); })} renderItem={(h, dragHandle) => (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              {dragHandle}
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-xs font-semibold text-accent capitalize">{h.icon?.slice(0, 3) ?? "—"}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{h.title}</p>
                {h.description && <p className="truncate text-sm text-muted-foreground">{h.description}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setModal({ open: true, item: { ...h } })} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => del(h.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          )} />
        ) : (
          <p className="py-8 text-center text-muted-foreground">No hobbies yet.</p>
        )}
      </div>

      <FormModal title={modal.item?.id ? "Edit Hobby" : "New Hobby"} open={modal.open} onClose={close}>
        <div className="space-y-4">
          <div><label className={labelCls}>Title *</label><input value={modal.item?.title ?? ""} onChange={(e) => setField("title", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Description</label><textarea value={modal.item?.description ?? ""} onChange={(e) => setField("description", e.target.value)} rows={3} className={textareaCls} /></div>
          <div><label className={labelCls}>Icon</label><select value={modal.item?.icon ?? "heart"} onChange={(e) => setField("icon", e.target.value)} className={inputCls}>{ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic.charAt(0).toUpperCase() + ic.slice(1)}</option>)}</select></div>
          <ImageUpload value={modal.item?.image_url ?? ""} onChange={(url) => setField("image_url", url)} bucket="blog-images" folder="hobbies" label="Hobby Image (optional)" />
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={close} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80 disabled:opacity-50">{pending ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </FormModal>
    </AdminShell>
  );
}
