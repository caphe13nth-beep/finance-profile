"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateSetting } from "@/app/actions/settings";
import { AdminShell } from "@/components/admin/admin-shell";
import { ImageUpload } from "@/components/admin/image-upload";
import { CheckCircle2 } from "lucide-react";

const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";

interface Identity {
  site_name: string;
  tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  og_image_url: string | null;
  site_mode: string;
  footer_text: string;
}

const EMPTY: Identity = {
  site_name: "", tagline: "", logo_url: null, favicon_url: null,
  og_image_url: null, site_mode: "hybrid", footer_text: "",
};

export default function AdminGeneralPage() {
  const [data, setData] = useState<Identity>(EMPTY);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  async function load() {
    const { data: row } = await createClient()
      .from("site_settings")
      .select("value")
      .eq("key", "site_identity")
      .single();
    if (row) setData({ ...EMPTY, ...(row.value as Partial<Identity>) });
  }

  useEffect(() => { load(); }, []);

  function set<K extends keyof Identity>(key: K, value: Identity[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function save() {
    start(async () => {
      await updateSetting("site_identity", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <AdminShell
      title="Site Identity"
      description="Name, branding, and site mode"
      actions={
        saved ? <span className="flex items-center gap-1 text-sm text-accent"><CheckCircle2 className="h-4 w-4" /> Saved</span> : null
      }
    >
      <div className="max-w-2xl space-y-5 rounded-2xl border border-border bg-card p-6">
        {/* Site name + tagline */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Site Name</label>
            <input value={data.site_name} onChange={(e) => set("site_name", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tagline</label>
            <input value={data.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls} />
          </div>
        </div>

        {/* Site mode */}
        <div>
          <label className={labelCls}>Site Mode</label>
          <select value={data.site_mode} onChange={(e) => set("site_mode", e.target.value)} className={inputCls}>
            <option value="personal">Personal — warm, story-driven</option>
            <option value="finance">Finance — KPIs, market data, calculators</option>
            <option value="hybrid">Hybrid — everything, admin toggles visibility</option>
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            Controls the overall tone and which sections are emphasized.
          </p>
        </div>

        {/* Footer text */}
        <div>
          <label className={labelCls}>Footer Text</label>
          <input value={data.footer_text} onChange={(e) => set("footer_text", e.target.value)} className={inputCls} />
        </div>

        {/* Logo upload */}
        <ImageUpload
          value={data.logo_url ?? ""}
          onChange={(url) => set("logo_url", url || null)}
          bucket="avatars"
          folder="branding"
          label="Logo"
        />

        {/* OG image */}
        <ImageUpload
          value={data.og_image_url ?? ""}
          onChange={(url) => set("og_image_url", url || null)}
          bucket="avatars"
          folder="branding"
          label="Default OG Image (1200×630)"
          maxSizeMb={2}
        />

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-50">
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
