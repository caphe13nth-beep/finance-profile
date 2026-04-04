"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateSetting } from "@/app/actions/settings";
import { AdminShell } from "@/components/admin/admin-shell";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2 } from "lucide-react";

const PAGE_META: Record<string, { label: string; description: string; path: string }> = {
  about: { label: "About", description: "Background, expertise, and career journey", path: "/about" },
  services: { label: "Services", description: "Service offerings and pricing", path: "/services" },
  portfolio: { label: "Portfolio", description: "Case studies and project outcomes", path: "/portfolio" },
  blog: { label: "Blog", description: "Articles and market insights", path: "/blog" },
  resources: { label: "Resources", description: "Downloadable whitepapers, guides, templates", path: "/resources" },
  contact: { label: "Contact", description: "Contact form, FAQ, and social links", path: "/contact" },
  tools: { label: "Tools", description: "Financial calculators", path: "/tools" },
  market_insights: { label: "Market Insights", description: "Investment theses and asset research", path: "/insights" },
};

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Record<string, boolean>>({});
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  async function load() {
    const { data } = await createClient()
      .from("site_settings")
      .select("value")
      .eq("key", "page_visibility")
      .single();
    if (data) setPages(data.value as Record<string, boolean>);
  }

  useEffect(() => { load(); }, []);

  function toggle(key: string, checked: boolean) {
    const updated = { ...pages, [key]: checked };
    setPages(updated);
    start(async () => {
      await updateSetting("page_visibility", updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const entries = Object.entries(pages);

  return (
    <AdminShell
      title="Page Visibility"
      description="Toggle which pages are accessible and shown in navigation"
      actions={
        saved ? (
          <span className="flex items-center gap-1 text-sm text-accent">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        ) : null
      }
    >
      <div className="max-w-2xl space-y-2">
        {entries.map(([key, enabled]) => {
          const meta = PAGE_META[key] ?? { label: key.replace(/_/g, " "), description: "", path: `/${key}` };
          return (
            <label
              key={key}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/30"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {meta.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {meta.description}
                  <span className="ml-2 font-mono text-muted-foreground/60">{meta.path}</span>
                </p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) => toggle(key, checked)}
                disabled={pending}
                aria-label={`Toggle ${meta.label} page`}
              />
            </label>
          );
        })}

        {entries.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            Loading pages...
          </p>
        )}
      </div>
    </AdminShell>
  );
}
