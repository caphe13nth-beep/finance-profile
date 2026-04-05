"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminCreate, adminUpdate, adminDeleteRow, adminReorder } from "@/app/actions/admin-crud";
import { AdminShell } from "@/components/admin/admin-shell";
import { FormModal } from "@/components/admin/form-modal";
import { ImageUpload } from "@/components/admin/image-upload";
import { SortableList } from "@/components/admin/sortable-list";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, FileText, BookOpen, FileSpreadsheet, BarChart3, Lock } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  file_path: string;
  thumbnail_url: string | null;
  is_gated: boolean;
  sort_order: number;
  created_at: string;
}

const EMPTY: Partial<Resource> = {
  title: "", description: "", type: "guide", file_path: "",
  thumbnail_url: "", is_gated: false, sort_order: 0,
};

const RESOURCE_TYPES = [
  { value: "whitepaper", label: "Whitepaper", icon: BookOpen },
  { value: "template", label: "Template", icon: FileSpreadsheet },
  { value: "guide", label: "Guide", icon: FileText },
  { value: "report", label: "Report", icon: BarChart3 },
  { value: "other", label: "Other", icon: FileText },
];

const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";
const textareaCls = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export default function AdminResourcesPage() {
  const [items, setItems] = useState<Resource[]>([]);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Resource> | null }>({ open: false, item: null });
  const [pending, start] = useTransition();

  async function load() {
    const { data } = await createClient().from("resources").select("*").order("sort_order");
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  function setField(k: string, v: unknown) {
    setModal((m) => ({ ...m, item: { ...m.item!, [k]: v } }));
  }
  function close() { setModal({ open: false, item: null }); }

  function save() {
    const p = modal.item;
    if (!p?.title || !p?.file_path) return;
    const data: Record<string, unknown> = {
      title: p.title,
      description: p.description || null,
      type: p.type || "other",
      file_path: p.file_path,
      thumbnail_url: p.thumbnail_url || null,
      is_gated: p.is_gated ?? false,
      sort_order: p.sort_order ?? 0,
    };
    start(async () => {
      if (p.id) await adminUpdate("resources", p.id, data, "/admin/resources");
      else await adminCreate("resources", data, "/admin/resources");
      close(); load();
    });
  }

  function del(id: string) {
    if (!confirm("Delete this resource?")) return;
    start(async () => { await adminDeleteRow("resources", id, "/admin/resources"); load(); });
  }

  return (
    <AdminShell
      title="Resources"
      description={`${items.length} resources`}
      actions={
        <button
          onClick={() => setModal({ open: true, item: { ...EMPTY, sort_order: items.length } })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80"
        >
          <Plus className="h-4 w-4" /> New
        </button>
      }
    >
      {items.length > 0 ? (
        <SortableList
          items={items}
          onReorder={(r) => start(async () => { await adminReorder("resources", r, "/admin/resources"); })}
          renderItem={(resource, dragHandle) => {
            const typeConf = RESOURCE_TYPES.find((t) => t.value === resource.type) ?? RESOURCE_TYPES[4];
            const TypeIcon = typeConf.icon;
            return (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                {dragHandle}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <TypeIcon className="h-4 w-4 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{resource.title}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{typeConf.label}</span>
                    {resource.is_gated && (
                      <span className="flex items-center gap-1 text-xs text-chart-2">
                        <Lock className="h-3 w-3" /> Gated
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{resource.file_path}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal({ open: true, item: { ...resource } })} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => del(resource.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          }}
        />
      ) : (
        <p className="py-8 text-center text-muted-foreground">No resources yet.</p>
      )}

      <FormModal title={modal.item?.id ? "Edit Resource" : "New Resource"} open={modal.open} onClose={close}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Title *</label>
            <input value={modal.item?.title ?? ""} onChange={(e) => setField("title", e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea value={modal.item?.description ?? ""} onChange={(e) => setField("description", e.target.value)} rows={3} className={textareaCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Type *</label>
              <select value={modal.item?.type ?? "guide"} onChange={(e) => setField("type", e.target.value)} className={inputCls}>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>File Path *</label>
              <input
                value={modal.item?.file_path ?? ""}
                onChange={(e) => setField("file_path", e.target.value)}
                className={inputCls}
                placeholder="reports/q1-2026.pdf"
              />
              <p className="mt-1 text-xs text-muted-foreground">Path within the &quot;documents&quot; storage bucket</p>
            </div>
          </div>

          <ImageUpload
            value={modal.item?.thumbnail_url ?? ""}
            onChange={(url) => setField("thumbnail_url", url)}
            bucket="documents"
            folder="thumbnails"
            label="Thumbnail"
          />

          <label className="flex items-center gap-3">
            <Switch checked={modal.item?.is_gated ?? false} onCheckedChange={(v) => setField("is_gated", v)} />
            <span className="text-sm">Require email to download (gated)</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={close} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80 disabled:opacity-50">
              {pending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </FormModal>
    </AdminShell>
  );
}
