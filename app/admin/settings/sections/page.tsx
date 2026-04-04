"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateSetting } from "@/app/actions/settings";
import { AdminShell } from "@/components/admin/admin-shell";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2 } from "lucide-react";

const SECTION_META: Record<string, { label: string; description: string }> = {
  hero: { label: "Hero", description: "Main hero banner with heading, CTAs, and background" },
  stats_bar: { label: "Stats Bar", description: "KPI cards with animated counters" },
  latest_insights: { label: "Latest Insights", description: "Recent blog posts grid" },
  featured_case_study: { label: "Featured Case Study", description: "Highlighted case study with KPI panel" },
  career_timeline: { label: "Career Timeline", description: "Professional journey vertical timeline" },
  testimonials: { label: "Testimonials", description: "Client feedback carousel" },
  newsletter_cta: { label: "Newsletter CTA", description: "Email subscription call-to-action" },
  services_preview: { label: "Services Preview", description: "Services overview section" },
  media_appearances: { label: "Media Appearances", description: "Press and media mentions" },
  personal_intro: { label: "Personal Intro", description: "Personal introduction section" },
  photo_gallery: { label: "Photo Gallery", description: "Personal photo gallery" },
  hobbies: { label: "Hobbies & Interests", description: "Hobbies and interests section" },
  personal_projects: { label: "Personal Projects", description: "Side projects and creative work" },
  what_i_do: { label: "What I Do", description: "Current activities and focus areas" },
  now_section: { label: "Now Section", description: "What I'm doing right now" },
  finance_ticker: { label: "Finance Ticker", description: "Scrolling stock/crypto prices bar" },
  calculators: { label: "Calculators", description: "Interactive financial calculators" },
  market_insights: { label: "Market Insights", description: "Market analysis and research" },
};

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<Record<string, boolean>>({});
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  async function load() {
    const { data } = await createClient()
      .from("site_settings")
      .select("value")
      .eq("key", "section_visibility")
      .single();
    if (data) setSections(data.value as Record<string, boolean>);
  }

  useEffect(() => { load(); }, []);

  function toggle(key: string, checked: boolean) {
    const updated = { ...sections, [key]: checked };
    setSections(updated);
    start(async () => {
      await updateSetting("section_visibility", updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const entries = Object.entries(sections);

  return (
    <AdminShell
      title="Section Visibility"
      description="Toggle homepage sections on or off"
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
          const meta = SECTION_META[key] ?? { label: key.replace(/_/g, " "), description: "" };
          return (
            <label
              key={key}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/30"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium capitalize text-foreground">
                  {meta.label}
                </p>
                {meta.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {meta.description}
                  </p>
                )}
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) => toggle(key, checked)}
                disabled={pending}
                aria-label={`Toggle ${meta.label}`}
              />
            </label>
          );
        })}

        {entries.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            Loading sections...
          </p>
        )}
      </div>
    </AdminShell>
  );
}
