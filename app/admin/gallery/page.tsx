"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { adminCreate, adminUpdate, adminDeleteRow, adminReorder } from "@/app/actions/admin-crud";
import { AdminShell } from "@/components/admin/admin-shell";
import { FormModal } from "@/components/admin/form-modal";
import { SortableList } from "@/components/admin/sortable-list";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";

interface Photo {
  id: string; image_url: string; caption: string | null; category: string | null; sort_order: number;
}

const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<Photo[]>([]);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Photo> | null }>({ open: false, item: null });
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data } = await createClient().from("photo_gallery").select("*").order("sort_order");
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  function setField(k: string, v: unknown) { setModal((m) => ({ ...m, item: { ...m.item!, [k]: v } })); }
  function close() { setModal({ open: false, item: null }); }

  function save() {
    const p = modal.item; if (!p?.image_url) return;
    const data: Record<string, unknown> = { image_url: p.image_url, caption: p.caption || null, category: p.category || null, sort_order: p.sort_order ?? items.length };
    start(async () => {
      if (p.id) await adminUpdate("photo_gallery", p.id, data, "/admin/gallery");
      else await adminCreate("photo_gallery", data, "/admin/gallery");
      close(); load();
    });
  }

  function del(id: string) { if (!confirm("Delete?")) return; start(async () => { await adminDeleteRow("photo_gallery", id, "/admin/gallery"); load(); }); }

  async function handleMultiUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const supabase = createClient();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("blog-images").upload(path, file, { upsert: true });
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from("blog-images").getPublicUrl(path);
        await adminCreate("photo_gallery", { image_url: publicUrl, caption: null, category: null, sort_order: items.length + i }, "/admin/gallery");
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  return (
    <AdminShell title="Photo Gallery" description={`${items.length} photos`}
      actions={
        <div className="flex gap-2">
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload Photos
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleMultiUpload} />
          <button onClick={() => setModal({ open: true, item: { image_url: "", caption: "", category: "", sort_order: items.length } })} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80">
            <Plus className="h-4 w-4" /> Add URL
          </button>
        </div>
      }>

      {items.length > 0 ? (
        <SortableList items={items} onReorder={(r) => start(async () => { await adminReorder("photo_gallery", r, "/admin/gallery"); })} renderItem={(photo, dragHandle) => (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-2">
            {dragHandle}
            <Image src={photo.image_url} alt={photo.caption ?? ""} width={80} height={60} className="h-14 w-20 rounded object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{photo.caption || "No caption"}</p>
              {photo.category && <p className="text-xs text-muted-foreground">{photo.category}</p>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setModal({ open: true, item: { ...photo } })} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => del(photo.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        )} />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No photos yet.</p>
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80">
            <Upload className="h-4 w-4" /> Upload First Photos
          </button>
        </div>
      )}

      <FormModal title={modal.item?.id ? "Edit Photo" : "Add Photo"} open={modal.open} onClose={close}>
        <div className="space-y-4">
          <div><label className={labelCls}>Image URL *</label><input value={modal.item?.image_url ?? ""} onChange={(e) => setField("image_url", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Caption</label><input value={modal.item?.caption ?? ""} onChange={(e) => setField("caption", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Category</label><input value={modal.item?.category ?? ""} onChange={(e) => setField("category", e.target.value)} className={inputCls} placeholder="Travel, Family, etc." /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={close} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80 disabled:opacity-50">{pending ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </FormModal>
    </AdminShell>
  );
}
