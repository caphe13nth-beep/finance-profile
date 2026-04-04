"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateSetting } from "@/app/actions/settings";
import { AdminShell } from "@/components/admin/admin-shell";
import { Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2 } from "lucide-react";

const inputCls = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";

interface NowItem { emoji: string; text: string; }
interface NowData { last_updated: string; items: NowItem[]; }

export default function AdminNowPage() {
  const [data, setData] = useState<NowData>({ last_updated: new Date().toISOString().slice(0, 10), items: [] });
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  async function load() {
    const { data: row } = await createClient().from("site_settings").select("value").eq("key", "now_section").single();
    if (row) setData(row.value as NowData);
  }
  useEffect(() => { load(); }, []);

  function updateItem(index: number, field: keyof NowItem, value: string) {
    setData((d) => {
      const items = [...d.items];
      items[index] = { ...items[index], [field]: value };
      return { ...d, items };
    });
  }

  function addItem() {
    setData((d) => ({ ...d, items: [...d.items, { emoji: "✨", text: "" }] }));
  }

  function removeItem(index: number) {
    setData((d) => ({ ...d, items: d.items.filter((_, i) => i !== index) }));
  }

  function moveItem(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= data.items.length) return;
    setData((d) => {
      const items = [...d.items];
      [items[index], items[next]] = [items[next], items[index]];
      return { ...d, items };
    });
  }

  function save() {
    start(async () => {
      await updateSetting("now_section", { ...data, last_updated: new Date().toISOString().slice(0, 10) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <AdminShell
      title="Now Section"
      description="What you're currently working on"
      actions={
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1 text-sm text-accent"><CheckCircle2 className="h-4 w-4" /> Saved</span>}
          <button onClick={addItem} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted">
            <Plus className="h-4 w-4" /> Add Item
          </button>
          <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-white hover:bg-accent/80 disabled:opacity-50">
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      }
    >
      <div className="max-w-2xl space-y-4">
        {/* Last updated */}
        <div className="max-w-xs">
          <label className={labelCls}>Last Updated</label>
          <input
            type="date"
            value={data.last_updated}
            onChange={(e) => setData((d) => ({ ...d, last_updated: e.target.value }))}
            className={`mt-1 ${inputCls}`}
          />
        </div>

        {/* Items */}
        <div className="space-y-2">
          {data.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
              {/* Reorder */}
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20" aria-label="Move up">
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button onClick={() => moveItem(i, 1)} disabled={i === data.items.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20" aria-label="Move down">
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>

              {/* Emoji */}
              <input
                value={item.emoji}
                onChange={(e) => updateItem(i, "emoji", e.target.value)}
                className="h-9 w-12 shrink-0 rounded-md border border-input bg-background text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={4}
              />

              {/* Text */}
              <input
                value={item.text}
                onChange={(e) => updateItem(i, "text", e.target.value)}
                placeholder="What are you doing?"
                className={`flex-1 ${inputCls}`}
              />

              {/* Delete */}
              <button onClick={() => removeItem(i)} className="shrink-0 rounded-md p-1.5 text-destructive hover:bg-destructive/10" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {data.items.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
              <p className="text-sm text-muted-foreground">No items yet.</p>
              <button onClick={addItem} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80">
                <Plus className="h-4 w-4" /> Add First Item
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
