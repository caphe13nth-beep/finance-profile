"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminCreate, adminUpdate, adminDeleteRow, adminReorder } from "@/app/actions/admin-crud";
import { AdminShell } from "@/components/admin/admin-shell";
import { FormModal } from "@/components/admin/form-modal";
import { ImageUpload } from "@/components/admin/image-upload";
import { SortableList } from "@/components/admin/sortable-list";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Star } from "lucide-react";

interface Project {
  id: string; title: string; description: string | null; category: string | null;
  image_url: string | null; link: string | null; tags: string[] | null;
  is_featured: boolean; sort_order: number; created_at: string;
}
const EMPTY: Partial<Project> = { title: "", description: "", category: "", image_url: "", link: "", tags: [], is_featured: false, sort_order: 0 };
const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";
const textareaCls = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export default function AdminProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Project> | null }>({ open: false, item: null });
  const [pending, start] = useTransition();

  async function load() { const { data } = await createClient().from("personal_projects").select("*").order("sort_order"); setItems(data ?? []); }
  useEffect(() => { load(); }, []);

  function setField(k: string, v: unknown) { setModal((m) => ({ ...m, item: { ...m.item!, [k]: v } })); }
  function close() { setModal({ open: false, item: null }); }

  function save() {
    const p = modal.item; if (!p?.title) return;
    const data: Record<string, unknown> = {
      title: p.title, description: p.description || null, category: p.category || null,
      image_url: p.image_url || null, link: p.link || null, tags: p.tags?.filter(Boolean) ?? [],
      is_featured: p.is_featured ?? false, sort_order: p.sort_order ?? 0,
    };
    start(async () => {
      if (p.id) await adminUpdate("personal_projects", p.id, data, "/admin/projects");
      else await adminCreate("personal_projects", data, "/admin/projects");
      close(); load();
    });
  }

  function del(id: string) { if (!confirm("Delete?")) return; start(async () => { await adminDeleteRow("personal_projects", id, "/admin/projects"); load(); }); }

  return (
    <AdminShell title="Personal Projects" description={`${items.length} projects`}
      actions={<button onClick={() => setModal({ open: true, item: { ...EMPTY, sort_order: items.length } })} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80"><Plus className="h-4 w-4" /> New</button>}>

      {items.length > 0 ? (
        <SortableList items={items} onReorder={(r) => start(async () => { await adminReorder("personal_projects", r, "/admin/projects"); })} renderItem={(p, dragHandle) => (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            {dragHandle}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{p.title}</p>
                {p.is_featured && <Star className="h-3.5 w-3.5 text-accent" />}
              </div>
              <p className="text-sm text-muted-foreground">{p.category ?? "No category"}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setModal({ open: true, item: { ...p } })} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => del(p.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        )} />
      ) : (
        <p className="py-8 text-center text-muted-foreground">No projects yet.</p>
      )}

      <FormModal title={modal.item?.id ? "Edit Project" : "New Project"} open={modal.open} onClose={close}>
        <div className="space-y-4">
          <div><label className={labelCls}>Title *</label><input value={modal.item?.title ?? ""} onChange={(e) => setField("title", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Description</label><textarea value={modal.item?.description ?? ""} onChange={(e) => setField("description", e.target.value)} rows={3} className={textareaCls} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Category</label><input value={modal.item?.category ?? ""} onChange={(e) => setField("category", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Link</label><input value={modal.item?.link ?? ""} onChange={(e) => setField("link", e.target.value)} className={inputCls} placeholder="https://..." /></div>
          </div>
          <ImageUpload value={modal.item?.image_url ?? ""} onChange={(url) => setField("image_url", url)} bucket="blog-images" folder="projects" label="Project Image" />
          <div><label className={labelCls}>Tags (comma separated)</label><input value={(modal.item?.tags ?? []).join(", ")} onChange={(e) => setField("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))} className={inputCls} /></div>
          <label className="flex items-center gap-3"><Switch checked={modal.item?.is_featured ?? false} onCheckedChange={(v) => setField("is_featured", v)} /><span className="text-sm">Featured project</span></label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={close} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80 disabled:opacity-50">{pending ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </FormModal>
    </AdminShell>
  );
}
