"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateSetting } from "@/app/actions/settings";
import { AdminShell } from "@/components/admin/admin-shell";
import { CheckCircle2 } from "lucide-react";

const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";
const textareaCls = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

interface SeoData {
  title_template: string;
  default_description: string;
  google_analytics_id: string;
  posthog_key: string;
}

export default function AdminSeoPage() {
  const [data, setData] = useState<SeoData>({ title_template: "", default_description: "", google_analytics_id: "", posthog_key: "" });
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  async function load() {
    const { data: row } = await createClient().from("site_settings").select("value").eq("key", "seo_defaults").single();
    if (row) setData({ ...data, ...(row.value as Partial<SeoData>) });
  }

  useEffect(() => { load(); }, []);

  function set<K extends keyof SeoData>(key: K, value: string) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function save() {
    start(async () => {
      await updateSetting("seo_defaults", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <AdminShell title="SEO Defaults" description="Global SEO and analytics configuration"
      actions={saved ? <span className="flex items-center gap-1 text-sm text-accent"><CheckCircle2 className="h-4 w-4" /> Saved</span> : null}>
      <div className="max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <label className={labelCls}>Title Template</label>
          <input value={data.title_template} onChange={(e) => set("title_template", e.target.value)} className={inputCls} placeholder="%s | Your Name" />
          <p className="mt-1 text-xs text-muted-foreground">Use %s as placeholder for the page title.</p>
        </div>
        <div>
          <label className={labelCls}>Default Description</label>
          <textarea value={data.default_description} onChange={(e) => set("default_description", e.target.value)} rows={2} className={textareaCls} />
        </div>
        <div>
          <label className={labelCls}>Google Analytics ID</label>
          <input value={data.google_analytics_id} onChange={(e) => set("google_analytics_id", e.target.value)} className={inputCls} placeholder="G-XXXXXXXXXX" />
        </div>
        <div>
          <label className={labelCls}>PostHog Key</label>
          <input value={data.posthog_key} onChange={(e) => set("posthog_key", e.target.value)} className={inputCls} placeholder="phc_..." />
        </div>
        <div className="pt-2">
          <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-50">
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
