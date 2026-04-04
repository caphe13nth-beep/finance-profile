"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateSetting } from "@/app/actions/settings";
import { AdminShell } from "@/components/admin/admin-shell";
import { CheckCircle2 } from "lucide-react";

const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";

const PLATFORMS = ["linkedin", "twitter", "youtube", "medium", "github", "instagram", "tiktok", "facebook"] as const;

export default function AdminSocialPage() {
  const [links, setLinks] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  async function load() {
    const { data: row } = await createClient().from("site_settings").select("value").eq("key", "social_links").single();
    if (row) setLinks(row.value as Record<string, string>);
  }

  useEffect(() => { load(); }, []);

  function save() {
    start(async () => {
      await updateSetting("social_links", links);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <AdminShell title="Social Links" description="Add your social media profile URLs"
      actions={saved ? <span className="flex items-center gap-1 text-sm text-accent"><CheckCircle2 className="h-4 w-4" /> Saved</span> : null}>
      <div className="max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6">
        {PLATFORMS.map((platform) => (
          <div key={platform}>
            <label className={labelCls}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</label>
            <input
              value={links[platform] ?? ""}
              onChange={(e) => setLinks((l) => ({ ...l, [platform]: e.target.value }))}
              placeholder={`https://${platform}.com/...`}
              className={inputCls}
            />
          </div>
        ))}
        <div className="pt-2">
          <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-50">
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
