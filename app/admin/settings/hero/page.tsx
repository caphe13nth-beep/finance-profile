"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateSetting } from "@/app/actions/settings";
import { AdminShell } from "@/components/admin/admin-shell";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2 } from "lucide-react";

const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";
const textareaCls = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

interface HeroData {
  heading: string;
  subheading: string;
  description: string;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
  show_cta_tertiary: boolean;
  cta_tertiary_text: string;
  background_style: string;
}

const EMPTY: HeroData = {
  heading: "", subheading: "", description: "",
  cta_primary_text: "", cta_primary_link: "/blog",
  cta_secondary_text: "", cta_secondary_link: "/contact",
  show_cta_tertiary: true, cta_tertiary_text: "",
  background_style: "grid",
};

export default function AdminHeroPage() {
  const [data, setData] = useState<HeroData>(EMPTY);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  async function load() {
    const { data: row } = await createClient()
      .from("site_settings")
      .select("value")
      .eq("key", "hero_content")
      .single();
    if (row) setData({ ...EMPTY, ...(row.value as Partial<HeroData>) });
  }

  useEffect(() => { load(); }, []);

  function set<K extends keyof HeroData>(key: K, value: HeroData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function save() {
    start(async () => {
      await updateSetting("hero_content", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <AdminShell
      title="Hero Content"
      description="Edit the homepage hero section"
      actions={
        saved ? <span className="flex items-center gap-1 text-sm text-accent"><CheckCircle2 className="h-4 w-4" /> Saved</span> : null
      }
    >
      <div className="max-w-2xl space-y-5 rounded-2xl border border-border bg-card p-6">
        <div>
          <label className={labelCls}>Heading</label>
          <input value={data.heading} onChange={(e) => set("heading", e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Subheading</label>
          <input value={data.subheading} onChange={(e) => set("subheading", e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea value={data.description} onChange={(e) => set("description", e.target.value)} rows={3} className={textareaCls} />
        </div>

        <fieldset className="space-y-4 rounded-lg border border-border p-4">
          <legend className="px-2 text-xs font-semibold text-muted-foreground">Primary CTA</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Button Text</label>
              <input value={data.cta_primary_text} onChange={(e) => set("cta_primary_text", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Link</label>
              <input value={data.cta_primary_link} onChange={(e) => set("cta_primary_link", e.target.value)} className={inputCls} placeholder="/blog" />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-lg border border-border p-4">
          <legend className="px-2 text-xs font-semibold text-muted-foreground">Secondary CTA</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Button Text</label>
              <input value={data.cta_secondary_text} onChange={(e) => set("cta_secondary_text", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Link</label>
              <input value={data.cta_secondary_link} onChange={(e) => set("cta_secondary_link", e.target.value)} className={inputCls} placeholder="/contact" />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-lg border border-border p-4">
          <legend className="px-2 text-xs font-semibold text-muted-foreground">Tertiary CTA</legend>
          <label className="flex items-center gap-3">
            <Switch
              checked={data.show_cta_tertiary}
              onCheckedChange={(checked) => set("show_cta_tertiary", checked)}
            />
            <span className="text-sm text-foreground">Show tertiary CTA</span>
          </label>
          {data.show_cta_tertiary && (
            <div>
              <label className={labelCls}>Button Text</label>
              <input value={data.cta_tertiary_text} onChange={(e) => set("cta_tertiary_text", e.target.value)} className={inputCls} placeholder="Download CV" />
            </div>
          )}
        </fieldset>

        <div>
          <label className={labelCls}>Background Style</label>
          <select value={data.background_style} onChange={(e) => set("background_style", e.target.value)} className={inputCls}>
            <option value="grid">Grid</option>
            <option value="dots">Dots</option>
            <option value="gradient">Gradient</option>
            <option value="none">None</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-50">
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
