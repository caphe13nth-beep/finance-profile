"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateSetting } from "@/app/actions/settings";
import { AdminShell } from "@/components/admin/admin-shell";
import { ImageUpload } from "@/components/admin/image-upload";
import { AvatarCoverUpload } from "@/components/admin/avatar-cover-upload";
import { CheckCircle2 } from "lucide-react";

const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";

interface Identity {
  site_name: string;
  tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  og_image_url: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  avatar_shape: string;
  cover_overlay: string;
  site_mode: string;
  footer_text: string;
  giscus_repo: string;
  giscus_repo_id: string;
  giscus_category: string;
  giscus_category_id: string;
}

const EMPTY: Identity = {
  site_name: "", tagline: "", logo_url: null, favicon_url: null,
  og_image_url: null, avatar_url: null, cover_image_url: null,
  avatar_shape: "squircle", cover_overlay: "gradient-mesh",
  site_mode: "hybrid", footer_text: "",
  giscus_repo: "", giscus_repo_id: "", giscus_category: "", giscus_category_id: "",
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
      description="Name, branding, site mode, and integrations"
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

        {/* Avatar & Cover */}
        <AvatarCoverUpload
          avatarUrl={data.avatar_url}
          coverUrl={data.cover_image_url}
          avatarShape={data.avatar_shape}
          onAvatarChange={(url) => set("avatar_url", url)}
          onCoverChange={(url) => set("cover_image_url", url)}
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Avatar Shape</label>
            <select value={data.avatar_shape} onChange={(e) => set("avatar_shape", e.target.value)} className={inputCls}>
              <option value="squircle">Squircle (default)</option>
              <option value="circle">Circle</option>
              <option value="hexagon">Hexagon</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Cover Overlay</label>
            <select value={data.cover_overlay} onChange={(e) => set("cover_overlay", e.target.value)} className={inputCls}>
              <option value="gradient-mesh">Gradient Mesh</option>
              <option value="gradient-linear">Gradient Linear</option>
              <option value="dark-vignette">Dark Vignette</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </div>

      {/* Giscus Comments */}
      <div className="mt-6 max-w-2xl space-y-5 rounded-2xl border border-border bg-card p-6">
        <div>
          <h3 className="font-heading text-base font-semibold">Giscus Comments</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Set up at{" "}
            <a href="https://giscus.app" target="_blank" rel="noopener noreferrer" className="text-accent underline">giscus.app</a>
            {" "}then paste the values below. Leave empty to disable comments.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Repository</label>
            <input value={data.giscus_repo} onChange={(e) => set("giscus_repo", e.target.value)} className={inputCls} placeholder="owner/repo" />
          </div>
          <div>
            <label className={labelCls}>Repository ID</label>
            <input value={data.giscus_repo_id} onChange={(e) => set("giscus_repo_id", e.target.value)} className={inputCls} placeholder="R_..." />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Category</label>
            <input value={data.giscus_category} onChange={(e) => set("giscus_category", e.target.value)} className={inputCls} placeholder="Announcements" />
          </div>
          <div>
            <label className={labelCls}>Category ID</label>
            <input value={data.giscus_category_id} onChange={(e) => set("giscus_category_id", e.target.value)} className={inputCls} placeholder="DIC_..." />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="mt-6 flex items-center gap-3">
        <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-white hover:bg-accent/80 disabled:opacity-50">
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
    </AdminShell>
  );
}
